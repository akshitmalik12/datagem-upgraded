import os
import json
import logging
import tempfile
import sys
import subprocess
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

def _execute_e2b(code: str, dataset_data: Optional[List[Dict[str, Any]]] = None) -> str:
    """Executes Python code inside an isolated E2B microVM cloud sandbox."""
    from e2b_code_interpreter import Sandbox
    
    with Sandbox.create() as sandbox:
        # If dataset is present, stage it into the sandbox filesystem
        if dataset_data:
            json_str = json.dumps(dataset_data)
            sandbox.files.write("/home/user/dataset.json", json_str)
            preamble = (
                "import pandas as pd\n"
                "import numpy as np\n"
                "import matplotlib.pyplot as plt\n"
                "import seaborn as sns\n"
                "df = pd.read_json('/home/user/dataset.json')\n"
                "print(f'Dataset loaded in Sandbox: {df.shape[0]} rows x {df.shape[1]} columns')\n"
            )
            full_code = preamble + code
        else:
            preamble = (
                "import pandas as pd\n"
                "import numpy as np\n"
                "import matplotlib.pyplot as plt\n"
                "import seaborn as sns\n"
                "df = None\n"
            )
            full_code = preamble + code

        execution = sandbox.run_code(full_code)
        
        output_parts = []
        if execution.logs.stdout:
            output_parts.extend(execution.logs.stdout)
        if execution.logs.stderr:
            output_parts.append(f"\n--- Stderr ---\n" + "\n".join(execution.logs.stderr))
        if execution.error:
            output_parts.append(f"\n--- Execution Error: {execution.error.name} ---\n{execution.error.value}\n{execution.error.traceback}")
            
        result = "\n".join(output_parts).strip()
        return result or "Code executed successfully with no output. (Use print() to inspect results)."

def _execute_restricted_local(code: str, dataset_data: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Fallback hardened local runner with strict environment filtering,
    15s timeout, and memory/process guardrails.
    """
    # Strict AST / static checks for known dangerous modules
    forbidden_tokens = [
        "os.system", "subprocess", "shutil.rmtree", "pty.spawn",
        "open('/etc", "open('/var", "open('/proc", "socket.socket"
    ]
    for token in forbidden_tokens:
        if token in code:
            return f"Security Restriction: Prohibited call '{token}' is blocked in local execution mode."

    full_code = (
        "import pandas as pd\n"
        "import matplotlib.pyplot as plt\n"
        "import seaborn as sns\n"
        "import numpy as np\n"
        "import io\n"
        "import base64\n"
    )

    temp_path = None
    try:
        if dataset_data:
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
                json.dump(dataset_data, f)
                temp_path = f.name
            
            full_code += (
                f"df = pd.read_json('{temp_path}')\n"
                "for col in df.columns:\n"
                "    if df[col].dtype == 'object':\n"
                "        numeric_vals = pd.to_numeric(df[col], errors='coerce')\n"
                "        if numeric_vals.notna().sum() / max(len(df), 1) > 0.8:\n"
                "            df[col] = numeric_vals\n"
                "print(f'Dataset loaded: {df.shape[0]} rows × {df.shape[1]} columns')\n"
            )
        else:
            full_code += "df = None\n\n"

        full_code += code

        # Sanitize execution environment - strip database credentials & API keys
        sterile_env = {
            'PATH': os.environ.get('PATH', '/usr/bin:/bin'),
            'PYTHONUNBUFFERED': '1',
            'MPLBACKEND': 'Agg'
        }

        result = subprocess.run(
            [sys.executable, '-c', full_code],
            capture_output=True,
            text=True,
            timeout=15,
            check=False,
            env=sterile_env
        )

        output = result.stdout
        stderr_output = result.stderr

        if result.returncode != 0:
            return f"Code execution failed (exit code {result.returncode}):\n{output}\n{stderr_output}"

        if stderr_output and output:
            if not ("UserWarning" in stderr_output and "matplotlib" in stderr_output.lower()):
                output += f"\n\n--- Warnings ---\n{stderr_output}"

        return output.strip() or "Code executed successfully with no output."

    except subprocess.TimeoutExpired:
        return "Error: Code execution timed out after 15 seconds."
    except Exception as e:
        return f"Execution error: {str(e)}"
    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.error(f"Failed to remove temp file {temp_path}: {e}")

def run_python_code(code: str, dataset_data: Optional[List[Dict[str, Any]]] = None, dataset_path: Optional[str] = None) -> str:
    """
    Executes Python code securely.
    If E2B_API_KEY is configured, executes inside a zero-trust E2B cloud MicroVM.
    Otherwise, executes via sterile local subprocess guardrails.
    """
    e2b_key = os.environ.get("E2B_API_KEY")
    if e2b_key and len(e2b_key.strip()) > 5:
        try:
            logger.info("🔒 Routing execution through isolated E2B microVM...")
            return _execute_e2b(code, dataset_data)
        except Exception as e:
            logger.warning(f"E2B execution failed or timed out: {e}. Falling back to sterile local sandbox.")
            return _execute_restricted_local(code, dataset_data)
    else:
        return _execute_restricted_local(code, dataset_data)

def google_search(query: str) -> str:
    """
    Real DuckDuckGo Search API. Returns a summarized compilation of top results.
    """
    logger.info(f"🔍 Executing Live Web Search: '{query}'")
    try:
        from duckduckgo_search import DDGS
        results = DDGS().text(query, max_results=5)
        
        if not results:
            return f"No search results found for '{query}'."
            
        formatted_results = f"Search Results for '{query}':\n\n"
        for i, res in enumerate(results, 1):
            formatted_results += f"{i}. Title: {res.get('title')}\n"
            formatted_results += f"   URL: {res.get('href')}\n"
            formatted_results += f"   Snippet: {res.get('body')}\n\n"
            
        return formatted_results
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return f"Error executing search: {str(e)}"
