import os
import google.generativeai as genai
from typing import Dict, Any
from dotenv import load_dotenv

try:
    from langgraph.graph import StateGraph, END
except ImportError:
    pass

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

def node_executor(state: dict) -> dict:
    query = state.get("user_query", "")
    
    # Try to actually answer it with Gemini!
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(f"You are DataGem. Answer this concisely: {query}")
        state["final_answer"] = response.text
    except Exception as e:
        state["final_answer"] = f"Real execution failed (Model execution error): {str(e)}"
        
    state["plan"] = ["1. Received query", "2. Forwarded to Gemini Flash", "3. Generated response"]
    return state

def build_agent_graph():
    try:
        workflow = StateGraph(dict)
        workflow.add_node("executor", node_executor)
        workflow.add_edge("executor", END)
        workflow.set_entry_point("executor")
        return workflow.compile()
    except Exception as e:
        print("LangGraph error:", e)
        return None
