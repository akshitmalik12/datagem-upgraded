import os
import time
import google.generativeai as genai
from google.generativeai.types import Tool, FunctionDeclaration
from PIL.Image import Image
from sqlalchemy.orm import Session
import traceback
import logging

logger = logging.getLogger(__name__)
# Internal imports
from database import crud, models as db_models

from chat import tools
from chat import db_tools

# =====================
# GEMINI API KEY CONFIGURATION
# =====================

# ⚠️ Recommended: use environment variable, fallback to hardcoded for local dev
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY not found. Set it in your environment or .env file.")

try:
    genai.configure(api_key=GEMINI_API_KEY)
except Exception as e:
    logger.error(f"Error configuring Gemini: {e}")


# =====================
# TOOL DEFINITIONS
# =====================

run_python_tool_schema = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="run_python_code",
            description="""Executes Python code for data analysis and visualization. 

🚫 DO NOT USE THIS TOOL FOR:
- Greetings: "hi", "hey", "hello", "good morning", "good evening", "good afternoon"
- General questions: "what can you do?", "what all can you do?", "who are you?", "what is DataGem?"
- Casual conversation: "thanks", "how are you?", "tell me about yourself"
- Questions that don't explicitly request data analysis, statistics, visualizations, or code execution

✅ ONLY USE THIS TOOL WHEN:
- User explicitly asks for data analysis, visualization, statistics, or code execution
- User requests: "create a chart", "show me statistics", "analyze data", "plot", "visualize", etc.
- User wants to process, analyze, or visualize their dataset

DATASET: If loaded, available as pandas DataFrame 'df' with columns already accessible.

PRE-IMPORTED LIBRARIES: pandas (pd), plotly.express (px), plotly.graph_objects (go), numpy (np), sklearn, json, duckdb

OUTPUT FORMAT:
- Use print() for all text outputs, statistics, and data summaries
- For DataFrames, Series, or statistics tables: use `print(df.to_markdown())` or `print(statistics.to_markdown())` to create nicely formatted markdown tables
- For visualizations: 
  1. Check column is numeric: if col not in df.select_dtypes(include=[np.number]).columns: skip or convert
  2. Create plot with plotly (px or go)
  3. Print the JSON representation with prefix: print(f"PLOTLY_JSON:{fig.to_json()}")

EXAMPLES:
- Summary with descriptive statistics:
  print("### Missing Values")
  missing = df.isnull().sum()
  missing_df = pd.DataFrame({'Column': missing.index, 'Missing Count': missing.values, 'Percentage': (missing.values / len(df) * 100)})
  print(missing_df.to_markdown())
  
  print("\n### Columns")
  cols_df = pd.DataFrame({
      'Column': df.columns,
      'Type': [str(df[col].dtype) for col in df.columns],
      'Description': ['Description here'] * len(df.columns)
  })
  print(cols_df.to_markdown())
  
  print("\n### Descriptive Statistics")
  desc_stats = df.describe()
  print(desc_stats.to_markdown())
- Visualization: 
  numeric_cols = df.select_dtypes(include=[np.number]).columns
  if len(numeric_cols) > 0:
      fig = px.histogram(df, x=numeric_cols[0], title=f'Distribution of {numeric_cols[0]}')
      print(f"PLOTLY_JSON:{fig.to_json()}")
- Analysis: print(f"Mean: {df['column'].mean()}")  # Only for numeric columns

IMPORTANT: Always use try-except for error handling. Check data types before operations!""",
            parameters={
                "type": "OBJECT",
                "properties": {
                    "code": {"type": "STRING", "description": "Complete Python code to execute. Must use print() for outputs. For plots, output JSON with PLOTLY_JSON: prefix."}
                },
                "required": ["code"]
            }
        )
    ]
)

google_search_tool_schema = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="google_search",
            description="Simulates a Google Search for educational use (returns mock data).",
            parameters={
                "type": "OBJECT",
                "properties": {
                    "query": {"type": "STRING", "description": "Search query string."}
                },
                "required": ["query"]
            }
        )
    ]
)

execute_sql_tool_schema = Tool(
    function_declarations=[
        FunctionDeclaration(
            name="execute_sql_query",
            description="Executes a SQL query against the database and returns the result.",
            parameters={
                "type": "OBJECT",
                "properties": {
                    "query": {"type": "STRING", "description": "The SELECT SQL query to execute."}
                },
                "required": ["query"]
            }
        )
    ]
)


# =====================
# MAIN AGENT CLASS
# =====================

class DataAnalystAgent:
    """Main DataGem AI Agent that handles Gemini interaction, tool calls, and chat history."""

    def __init__(self, db: Session, user: db_models.User, dataset: list[dict] | None = None, dataset_path: str = None, connection_string: str = None, session_id: str = "default"):
        self.db = db
        self.user = user
        self.dataset = dataset
        self.dataset_path = dataset_path
        self.connection_string = connection_string
        self.session_id = session_id
        self.model = None
        self.chat = None
        
        # Tier logic
        self.tier = getattr(self.user, 'tier', 'free').lower()

        try:
            # Build system instruction - comprehensive and clear
            system_instruction = """You are DataGem, a friendly AI assistant and expert data analyst. You can have natural conversations AND analyze data.

⚠️ CRITICAL DECISION: Is this a data analysis question or a general conversation?

FOR GENERAL CONVERSATION (respond naturally, NO tools):
✅ Greetings: "hi", "hey", "hello", "good morning", "good evening", "good afternoon", "how are you", "what's up"
✅ Questions about you: "what can you do?", "what all can you do?", "who are you?", "what is DataGem?", "tell me about yourself"
   ✅ General chat: "thanks", "thank you", "goodbye", "bye", "okay", "cool"
✅ Casual conversation that doesn't mention data, analysis, statistics, charts, or visualizations
→ For these: Respond naturally and conversationally like a normal chatbot. Do NOT use any tools. Just chat!
→ Be friendly, helpful, and engaging. Mention your capabilities if asked, but don't run any code.

FOR DATA ANALYSIS QUESTIONS (use run_python_code tool):
✅ Questions about: data, dataset, statistics, analysis, visualize, plot, chart, graph, correlation, heatmap, box plot, scatter plot
✅ Requests to: create, show, display, analyze, calculate, find data insights
→ For these: YOU MUST use the run_python_code tool to execute Python code

CRITICAL RULES FOR DATA ANALYSIS:
1. ALWAYS use the run_python_code tool when asked to analyze data or create visualizations
2. The dataset is already loaded as a pandas DataFrame named 'df' - use it directly
3. NEVER ask the user for data - it's already available
4. ALWAYS check data types before operations - use df.select_dtypes(include=[np.number]) for numeric columns
5. ALWAYS use try-except blocks for error handling in your code
6. If code fails, analyze the error and provide a corrected version
7. ALWAYS provide comprehensive text summaries with tables and formatted text after running code
8. For visualizations: ONLY use numeric columns, create plots, save as base64, and explain what they show
9. When generating summaries: ALWAYS include descriptive statistics using df.describe().to_markdown() - this is REQUIRED

AVAILABLE LIBRARIES (pre-imported):
- pandas (pd) - data manipulation
- plotly.express (px) - fast plotting
- plotly.graph_objects (go) - advanced plotting
- numpy (np) - numerical operations
- sklearn - machine learning (all modules: LinearRegression, train_test_split, metrics, etc.)
- json - for saving/encoding JSON

WHEN CREATING VISUALIZATIONS:
1. ALWAYS check if columns are numeric before plotting: numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
2. Only use numeric columns for plots (avoid string/ID columns)
3. Handle errors gracefully with try-except blocks
4. Create the plot using plotly (px or go)
5. Output as JSON with prefix: print(f"PLOTLY_JSON:{fig.to_json()}")

RESPONSE FORMAT:
  - ALWAYS show the code you're running (it will be displayed automatically)
  - Run code using the tool
  - IMPORTANT: When showing DataFrames or statistics, use `print(df.to_markdown())` or `print(statistics.to_markdown())` to create formatted tables
  - After code execution, provide a CONCISE TEXT SUMMARY:
    * Direct answers - no fluff
    * Key findings only
    * Tables with actual data (extract from code output)
    * Brief insights, no redundancy

TEXT SUMMARY REQUIREMENTS:
- Write CONCISE summaries after code execution - be direct and to the point
- Structure:
  * Brief intro (1-2 sentences max)
  * Key findings/tables from code output
  * Brief insights (2-3 bullet points)
  * Optional: 1-2 next step suggestions
- Extract REAL values from code output - never use placeholders
- NO redundancy - don't repeat information already shown in code output
- Be direct and efficient - users want answers fast

VISUALIZATION REQUIREMENTS:
- ALWAYS create visualizations when asked
- Use clear, informative titles and labels
- Make plots readable and professional
- Output ALL plots as plotly JSON

CODE REQUIREMENTS:
- Show complete, runnable code
- Include comments for clarity
- Handle edge cases
- Use appropriate libraries for the task

Be helpful, thorough, and always provide value with comprehensive summaries including tables!"""
            
            if self.connection_string:
                schema = db_tools.get_database_schema(self.connection_string)
                system_instruction += f"\n\nYou are connected to a LIVE SQL DATABASE. You must write SQL queries to answer the user. Database Schema:\n{schema}"
            
            # Initialize the Gemini model with tools and function calling config
            self.model = genai.GenerativeModel(
                model_name="models/gemini-3.6-flash",  # Use flash or pro depending on speed/quality preference
                tools=[run_python_tool_schema, google_search_tool_schema, execute_sql_tool_schema],
                tool_config={
                    "function_calling_config": {
                        "mode": "AUTO",  # AUTO enables model to decide when to call functions
                    }
                },
                system_instruction=system_instruction
            )
            
            # Create a separate model WITHOUT tools for generating text summaries
            self.text_model = genai.GenerativeModel(
                model_name="models/gemini-3.6-flash",
                system_instruction="You are DataGem, an expert data analyst. You provide comprehensive text summaries with formatted markdown tables and insights. Always write clear, helpful explanations."
            )

            # Load chat history from DB (Limit to last 10 messages/5 turns to drastically reduce API latency and token usage)
            history_db = crud.get_chat_history(db=self.db, user_id=self.user.id, session_id=self.session_id)[:10]
            history_gemini = self.convert_db_history_to_gemini(history_db)

            # Start a Gemini chat session
            self.chat = self.model.start_chat(history=history_gemini)
            # Removed "Ready" message - it might interfere with responses

        except Exception as e:
            logger.error(f"Error initializing DataAnalystAgent: {e}")
            traceback.print_exc()

    # ------------------------------------------------------------------
    def convert_db_history_to_gemini(self, history_db: list[db_models.ChatHistory]) -> list[dict]:
        """Convert stored SQL chat history into Gemini-compatible format."""
        gemini_history = []
        for msg in reversed(history_db):
            gemini_history.append({
                "role": msg.role,
                "parts": [{"text": msg.content}]
            })
        return gemini_history

    def _is_conversational(self, prompt: str) -> bool:
        """Detect if a prompt is conversational (greetings, casual chat) vs data analysis."""
        prompt_lower = prompt.lower().strip()
        single_word_greetings = {"hey", "hi", "hello", "hey!", "hi!", "hello!"}
        if prompt_lower in single_word_greetings:
            return True
        conversational_keywords = ["good morning", "good evening", "good afternoon", "good night",
                                   "what can you do", "what all can you do", "who are you", "tell me about yourself",
                                   "thanks", "thank you", "how are you", "what's up", "what's going on"]
        data_keywords = ["data", "dataset", "analyze", "analysis", "statistics", "visualize", "visualization",
                         "plot", "chart", "graph", "correlation", "heatmap", "scatter", "box plot", "histogram",
                         "create a", "show me", "display", "calculate", "find", "insights", "summary report",
                         "pdf", "html", "model", "predict"]
        has_conversational = any(keyword in prompt_lower for keyword in conversational_keywords)
        has_data_keywords = any(keyword in prompt_lower for keyword in data_keywords)
        return has_conversational and not has_data_keywords

    def _extract_text_from_event(self, event):
        """Extract text content from a Gemini streaming event via any available path."""
        try:
            if hasattr(event, "text") and event.text:
                return event.text
        except Exception:
            pass
        try:
            if hasattr(event, "candidates") and event.candidates:
                for cand in event.candidates:
                    if hasattr(cand, "content") and cand.content:
                        if hasattr(cand.content, "parts"):
                            for part in cand.content.parts:
                                if hasattr(part, "function_call") and part.function_call:
                                    continue
                                if hasattr(part, "text") and part.text:
                                    return part.text
        except Exception:
            pass
        try:
            if hasattr(event, "parts"):
                for part in event.parts:
                    if hasattr(part, "function_call") and part.function_call:
                        continue
                    if hasattr(part, "text") and part.text:
                        return part.text
        except Exception:
            pass
        return None

    def _stream_followup_text(self, prompt_text: str):
        """Generate text summary via text_model and yield text chunks."""
        try:
            followup_response = self.text_model.generate_content(prompt_text, stream=True)
        except Exception as e:
            logger.error(f"Error starting summary: {e}")
            simple_prompt = f"Summarize these results concisely:\n\n{prompt_text[:4000]}"
            followup_response = self.text_model.generate_content(simple_prompt, stream=True)

        has_text = False
        accumulated = ""
        try:
            for event in followup_response:
                text = self._extract_text_from_event(event)
                if text:
                    has_text = True
                    accumulated += text
                    yield text
        except Exception as e:
            logger.error(f"Error processing followup: {e}")

        if not has_text:
            try:
                if hasattr(followup_response, "text") and followup_response.text:
                    yield followup_response.text
                    has_text = True
            except Exception:
                pass
        
        if not has_text:
            yield "\n\nAnalysis completed. Review the code and output above."

    def _build_summary_prompt(self, tool_result: str, has_image: bool, code_failed: bool) -> str:
        """Build the prompt for the text_model to generate a summary."""
        tool_result_preview = tool_result[:16000] if tool_result else 'No results'
        if tool_result and len(tool_result) > 16000:
            tool_result_preview = tool_result[:8000] + '\n... (truncated) ...\n' + tool_result[-8000:]

        if code_failed:
            return f"""Code execution error:\n\n{tool_result_preview}\n\nProvide a brief summary based on available dataset info. Be concise.\n\nFormat:\n[Brief explanation of error/what was attempted]\n\n[Key dataset info if available]\n\n**Next steps:** [1-2 suggestions]\n\nKeep it short - text only, no tools."""
        else:
            return f"""Code executed successfully. Results:\n\n{tool_result_preview}\n\nWrite a CONCISE summary. Be direct - no fluff, no redundancy.\n\nRequirements:\n- Extract key findings from code output above\n- Show actual data/tables (use markdown tables)\n- 2-3 brief insights only\n- NO repetition of what's already in code output\n- Keep it short and actionable\n\nFormat:\nDataGem: [Brief 1-sentence intro]\n\n[Key findings/tables from code output]\n\n**Insights:**\n- [1-2 bullet points]\n\n{"**Visualization:** [Brief description if plot was generated]" if has_image else ""}\n\nStart NOW - text only, no tools."""

    async def _handle_tool_call(self, fc, prompt: str):
        """Execute a tool call and yield results + summary."""
        tool_name = fc.name if hasattr(fc, "name") else "unknown"
        tool_args = dict(fc.args) if hasattr(fc, "args") and fc.args else {}
        
        if self._is_conversational(prompt):
            logger.warning(f"BLOCKED: Tool call '{tool_name}' for conversational prompt. Ignoring.")
            return
        
        logger.info(f"Executing tool: {tool_name}")
        yield f"\n\n**Executing:** `{tool_name}`\n\n"
        
        try:
            tool_result = None
            if tool_name == "run_python_code":
                code = tool_args.get("code", "")
                if not code:
                    tool_result = "Error: No code provided to execute."
                else:
                    yield f"```python\n{code}\n```\n\n"
                    
                    max_retries = 2
                    for attempt in range(max_retries + 1):
                        print(f"💻 Running Python code (Attempt {attempt + 1})...")
                        tool_result = tools.run_python_code(code, self.dataset, getattr(self, "dataset_path", None))
                        
                        # Check if it failed
                        if "Code execution failed" in tool_result or "Error:" in tool_result:
                            if attempt < max_retries:
                                # yield f"\nCode execution failed. Debugger Agent is rewriting the code (Attempt {attempt + 1}/{max_retries})...\n"
                                print(f"⚠️ Code failed (Attempt {attempt + 1}). Error: {tool_result[:200]}")
                                
                                # Spawn debugger prompt
                                debug_prompt = f"The following pandas code failed with this error:\n\nCode:\n```python\n{code}\n```\n\nError:\n{tool_result}\n\nRewrite the code to fix this error. Return ONLY the raw Python code. Do not use markdown blocks, just the code itself."
                                
                                try:
                                    debug_response = self.text_model.generate_content(debug_prompt)
                                    new_code = debug_response.text.strip()
                                    if new_code.startswith("```python"):
                                        new_code = new_code[9:]
                                    if new_code.endswith("```"):
                                        new_code = new_code[:-3]
                                    code = new_code.strip()
                                    yield f"\n**Debugger Agent wrote new code:**\n```python\n{code}\n```\n\n"
                                except Exception as e:
                                    print(f"Debugger failed: {e}")
                                    break # Give up on retrying
                            else:
                                print(f"❌ Code failed after {max_retries} retries.")
                        else:
                            print(f"✅ Code execution completed successfully")
                            break # Success!
                    
                    if tool_result:
                        yield f"\n**Code Output:**\n```\n{tool_result}\n```\n\n"
            elif tool_name == "google_search":
                query = tool_args.get("query", "")
                tool_result = tools.google_search(query)
            elif tool_name == "execute_sql_query":
                query = tool_args.get("query", "")
                yield f"\n**SQL Query:**\n```sql\n{query}\n```\n\n"
                tool_result = db_tools.execute_sql_query(self.connection_string, query)
                yield f"\n**SQL Result:**\n```\n{tool_result}\n```\n\n"
            else:
                tool_result = f"Error: Unknown tool `{tool_name}`"
            
            if tool_result is None:
                tool_result = "Error: Tool execution returned no result."
            
            has_image = "<<<PLOTLY_JSON_START>>>" in tool_result if tool_result else ("PLOTLY_JSON:" in tool_result if tool_result else False)
            code_failed = ("Code execution failed" in tool_result or "Error:" in tool_result) if tool_result else False
            
            # CRITICAL: Strip out the massive Plotly JSON before sending to the summarization agent to save tokens and prevent confusion
            clean_tool_result = tool_result
            if clean_tool_result:
                import re as regex
                clean_tool_result = regex.sub(r'<<<PLOTLY_JSON_START>>>[\s\S]*?<<<PLOTLY_JSON_END>>>', '[PLOTLY GRAPH GENERATED]', clean_tool_result)
                clean_tool_result = regex.sub(r'PLOTLY_JSON:\{[\s\S]*?\}(?=\n|$)', '[PLOTLY GRAPH GENERATED]', clean_tool_result)
            
            summary_prompt = self._build_summary_prompt(clean_tool_result, has_image, code_failed)
            logger.info("Generating text summary...")
            
            summary_text = ""
            for text_chunk in self._stream_followup_text(summary_prompt):
                summary_text += text_chunk
                yield text_chunk
            
            logger.info(f"Summary generated ({len(summary_text)} chars)")
            
        except Exception as tool_error:
            error_msg = f"Error executing tool `{tool_name}`: {str(tool_error)}"
            logger.error(f"{error_msg}")
            traceback.print_exc()
            yield f"\n{error_msg}\n"
            
            error_prompt = f"Tool execution error: {error_msg}\nProvide a brief summary. Text only."
            for text_chunk in self._stream_followup_text(error_prompt):
                yield text_chunk

    query_cache = {} # Static class-level cache

    async def stream_response(self, prompt: str, image: Image | None = None, max_iterations: int = 10):
        # --- CACHING LOGIC ---
        cache_key = prompt.lower().strip()
        if cache_key in self.query_cache and not image:
            yield "\n[⚡ Returning instantaneous cached response to save API tokens...]\n"
            yield self.query_cache[cache_key]
            return
        # ---------------------
        self._tool_called_this_turn = False
        """Streams Gemini's response, handles tool calls, and saves messages to DB."""
        
        logger.info(f"Processing prompt: {prompt[:100]}...")

        crud.save_chat_message(
            db=self.db,
            user_id=self.user.id,
            session_id=self.session_id,
            role="user",
            content=prompt
        )

        # Strategy 2: Local Rule-Based NLP for Basic Stats (No API calls!)
        prompt_lower = prompt.lower().strip()
        if self.dataset and len(self.dataset) > 0:
            if prompt_lower in ["how many rows?", "how many rows", "row count", "count rows", "dataset size"]:
                yield f"\nThis dataset contains **{len(self.dataset)} rows**.\n"
                return
            elif prompt_lower in ["what are the columns?", "what are the columns", "list columns", "show columns"]:
                columns = list(self.dataset[0].keys())
                yield f"\nThe dataset has {len(columns)} columns:\n\n" + "\n".join([f"- `{col}`" for col in columns]) + "\n"
                return
            elif prompt_lower in ["show me the top 5 rows", "top 5 rows", "head", "preview"]:
                import pandas as pd
                df = pd.DataFrame(self.dataset)
                yield f"\nHere are the top 5 rows:\n\n{df.head().to_markdown()}\n"
                return
                
        is_conversational = self._is_conversational(prompt)
        
        # --- MULTI-AGENT PLANNER ---
        if not is_conversational and (self.dataset or self.dataset_path or self.connection_string):
            yield "\n[🧠 AI Planner is evaluating your request...]\n"
            try:
                import google.generativeai as genai
                planner = genai.GenerativeModel(
                    model_name="models/gemini-3.6-flash",
                    system_instruction="You are a Senior Data Scientist Planner. Read the user's request. If it is ambiguous (e.g., 'plot a histogram' without specifying which column), respond EXACTLY with 'AMBIGUOUS'. If it's clear, output a strict 3-step bulleted plan."
                )
                res = planner.generate_content(prompt)
                plan = res.text.strip()
                
                if "AMBIGUOUS" in plan:
                    yield "The request is a bit ambiguous. What exactly would you like me to plot or analyze?\n\n"
                    # We just return here so it doesn't execute broken code!
                    return
                else:
                    # WE DO NOT YIELD THE PLAN. THE USER JUST WANTS TO SEE THE RESULT!
                    prompt = f"User Request: {prompt}\n\nFollow this execution plan exactly:\n{plan}\n\nIMPORTANT: Print plotly charts using fig.to_json() surrounded by <<<PLOTLY_JSON_START>>> and <<<PLOTLY_JSON_END>>>."
            except Exception as e:
                pass
        # ---------------------------
        
        enhanced_prompt = prompt
        if is_conversational:
            dataset_info = ""
            if self.dataset and len(self.dataset) > 0:
                row_count = len(self.dataset)
                columns = list(self.dataset[0].keys()) if self.dataset else []
                dataset_info = f" I can see you have a dataset loaded with {row_count} rows and {len(columns)} columns. I'm ready to help you analyze it whenever you're ready!"
            
            enhanced_prompt = f"""User said: "{prompt}"

You are DataGem, a friendly AI assistant and expert data analyst. The user is just having a casual conversation or greeting you.

Respond naturally and conversationally:
- If it's "hey", "hi", or "hello": Greet them warmly and offer to help with data analysis{dataset_info}
- If they ask what you can do: Briefly explain that you're DataGem, an AI data analyst that can analyze datasets, create visualizations, find insights, build models, etc. Keep it concise and friendly.
- If they ask "who are you": Tell them you're DataGem, an AI assistant specialized in data analysis
- NEVER start your messages with "DataGem:" or "DataGem here:". Just speak directly.
- For any other casual conversation: Respond naturally, be friendly and helpful

Keep your response:
- Short and friendly (2-3 sentences max)
- Conversational and natural
- Helpful but not overwhelming
- End with an offer to help with data analysis if relevant

Remember: This is just a chat - no data analysis, no code, just a friendly conversation."""
            logger.info(f"Detected conversational prompt ('{prompt}') - responding naturally without tools")
        elif self.dataset and len(self.dataset) > 0:
            sample_row = self.dataset[0] if self.dataset else {}
            columns = list(sample_row.keys()) if sample_row else []
            row_count = len(self.dataset)
            
            numeric_cols = []
            if self.dataset and len(self.dataset) > 0:
                for col in columns:
                    try:
                        sample_values = [self.dataset[i].get(col, '') for i in range(min(5, len(self.dataset)))]
                        numeric_count = sum(1 for v in sample_values if isinstance(v, (int, float)) or (isinstance(v, str) and v.replace('.', '').replace('-', '').isdigit()))
                        if numeric_count >= 2:
                            numeric_cols.append(col)
                    except Exception as e:
                        pass
            
            dataset_context = f"""User question: {prompt}

Dataset available:
- {row_count} rows, {len(columns)} columns
- All columns: {', '.join(columns)}
- Numeric columns: {', '.join(numeric_cols) if numeric_cols else 'None detected'}
- DataFrame name: 'df'
- DuckDB connection: 'conn' (use `conn.execute("SELECT * FROM df").df()` for lightning-fast SQL queries on the dataset)

IMPORTANT: 
- Use run_python_code tool ONLY ONCE per prompt. Do not call it multiple times.
- For visualizations, you MUST print plots as plotly JSON explicitly wrapped in <<<PLOTLY_JSON_START>>> and <<<PLOTLY_JSON_END>>> tags. 
  CRITICAL EXAMPLE FOR PLOTTING:
  fig = px.histogram(df, x='Age')
  import json
  print("<<<PLOTLY_JSON_START>>>" + fig.to_json() + "<<<PLOTLY_JSON_END>>>")
- DO NOT generate graphs or plots UNLESS the user explicitly asks for a visualization, plot, or graph. If they ask for summary statistics, only provide a text table.
- Do not output text before calling the tool.
- After running code, provide a CONCISE text summary:
  * Key findings only - no redundancy
  * Brief tables with actual data
- NEVER output raw Python code in your conversational text responses. The user can already see the code in the 'View Python Analysis' section. Do not print ```python blocks in your chat messages. EVER.
  * 2-3 insights maximum
  * Direct and actionable
- When asked for a summary, generate tables with key statistics and findings
- Format summaries like ChatGPT or Gemini with structured tables and clear explanations"""
            enhanced_prompt = dataset_context
            logger.info(f"Enhanced prompt with dataset context ({row_count} rows, {len(columns)} columns)")

        prompt_parts = [enhanced_prompt]
        if image:
            prompt_parts.append(image)

        ai_response_content = ""

        try:
            if is_conversational:
                logger.info("Using text-only model for conversational response")
                response_stream = self.text_model.generate_content(prompt_parts, stream=True)
            else:
                logger.info("Starting Gemini stream with tools...")
                response_stream = self.chat.send_message(prompt_parts, stream=True)

            for event in response_stream:
                text = self._extract_text_from_event(event)
                if text:
                    ai_response_content += text
                    yield text
                
                if hasattr(event, "parts") and event.parts:
                    for part in event.parts:
                        if hasattr(part, "function_call") and part.function_call:
                            if not getattr(self, "_tool_called_this_turn", False):
                                self._tool_called_this_turn = True
                                async for chunk in self._handle_tool_call(part.function_call, prompt):
                                    ai_response_content += chunk
                                    yield chunk
                            else:
                                logger.warning("Skipping duplicate tool call from event.parts")
                
                if hasattr(event, "candidates") and event.candidates:
                    for cand in event.candidates:
                        if hasattr(cand, "content") and cand.content:
                            if hasattr(cand.content, "parts"):
                                for part in cand.content.parts:
                                    if hasattr(part, "function_call") and part.function_call:
                                        if not getattr(self, "_tool_called_this_turn", False):
                                            self._tool_called_this_turn = True
                                            async for chunk in self._handle_tool_call(part.function_call, prompt):
                                                ai_response_content += chunk
                                                yield chunk
                                        else:
                                            logger.warning("Skipping duplicate tool call from event.candidates")

        except Exception as e:
            error_msg = f"❌ Error generating response: {e}"
            logger.error(error_msg)
            traceback.print_exc()
            yield f"\n{error_msg}\n"
            ai_response_content += error_msg

        if not ai_response_content.strip():
            fallback_msg = "No response was generated. Please try again."
            yield fallback_msg
            ai_response_content = fallback_msg
            
        if not image:
            self.query_cache[cache_key] = ai_response_content

        crud.save_chat_message(
            db=self.db,
            user_id=self.user.id,
            session_id=self.session_id,
            role="model",
            content=ai_response_content
        )
