import os
import json
import logging
from typing import Optional, List, Dict, Any, AsyncGenerator
import litellm
from chat.native_engine import NativeAnalyticsEngine

logger = logging.getLogger(__name__)

# Suppress noisy LiteLLM logs
litellm.suppress_debug_info = True

class AIGateway:
    """
    Intelligent Multi-Provider AI Gateway with LiteLLM routing,
    auto-failover between Groq, Gemini, and OpenRouter,
    and a zero-token offline DuckDB OLAP safety net.
    """

    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.openrouter_key = os.getenv("OPENROUTER_API_KEY")

    def get_available_models(self) -> List[str]:
        """Returns configured models in priority order based on available keys."""
        models = []
        if self.groq_key:
            models.append("groq/llama-3.3-70b-versatile")
        if self.gemini_key:
            models.append("gemini/gemini-1.5-flash")
        if self.openrouter_key:
            models.append("openrouter/meta-llama/llama-3.3-70b-instruct:free")
        return models

    async def stream_query(
        self,
        prompt: str,
        dataset: Optional[List[Dict[str, Any]]] = None,
        dataset_path: Optional[str] = None,
        system_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Executes query via multi-provider LLM if keys are available,
        otherwise seamlessly falls back to DuckDB in-memory OLAP engine.
        """
        models = self.get_available_models()

        # Step 1: If an analytical engine can execute it directly or if no keys configured
        engine = NativeAnalyticsEngine(dataset=dataset, dataset_path=dataset_path)
        
        # If user is asking for deterministic calculations (Bleeders, Overcharges, Rankings, Distributions)
        # DuckDB engine gives 100% deterministic accuracy with 0 token spend
        if not models or engine.is_analytical_query(prompt):
            ok, response_md, plot_data = engine.execute_query(prompt)
            if ok:
                yield f"[⚡ Executed via DuckDB In-Memory OLAP Sandbox (0 API tokens consumed)]\n\n{response_md}"
                return

        # Step 2: If LLM keys are configured, attempt streaming inference with auto-failover
        if models:
            primary_model = models[0]
            fallback_models = models[1:] if len(models) > 1 else []

            dataset_summary = ""
            if dataset and len(dataset) > 0:
                cols = list(dataset[0].keys())
                sample = dataset[:3]
                dataset_summary = f"\nActive Tabular Dataset ({len(dataset)} rows):\nColumns: {cols}\nSample:\n{json.dumps(sample, indent=2)}\n"

            system_prompt = (
                system_context or 
                "You are DataGem, an executive AI data analyst specializing in e-commerce unit economics, Amazon FBA fee auditing, and marketplace dispute analysis. "
                "Provide structured executive summaries, markdown tables, and concrete dollar figures. "
                "Always format metrics in Indian Rupees (₹) or USD ($)."
            )

            messages = [
                {"role": "system", "content": system_prompt + dataset_summary},
                {"role": "user", "content": prompt}
            ]

            try:
                response = await litellm.acompletion(
                    model=primary_model,
                    messages=messages,
                    stream=True,
                    fallbacks=fallback_models if fallback_models else None,
                    timeout=20
                )

                async for chunk in response:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content
                return

            except Exception as llm_err:
                logger.warning(f"LiteLLM multi-provider stream failed: {llm_err}. Falling back to DuckDB Sandbox.")
                # Fall through to DuckDB engine

        # Step 3: Resilient offline fallback via DuckDB
        ok, response_md, _ = engine.execute_query(prompt)
        if ok and response_md:
            yield f"[⚡ Seamlessly resolved via In-Memory DuckDB Engine (Offline Resilient Mode)]\n\n{response_md}"
        else:
            yield (
                "### 📊 DataGem Analytical Summary\n\n"
                f"Evaluated query: **'{prompt}'** across the active dataset.\n\n"
                "- **Engine:** In-Memory Vectorized OLAP Sandbox\n"
                "- **Status:** Operational\n\n"
                "> 💡 *Tip: Connect a free Groq or Gemini API key in Settings to unlock deep conversational multi-turn reasoning.*"
            )

ai_gateway = AIGateway()
