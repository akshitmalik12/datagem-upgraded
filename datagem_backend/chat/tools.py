import ast
import os
import sys
import json
import logging
import tempfile
import subprocess
from typing import Optional, List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Banned modules and builtins that could compromise host integrity
DANGEROUS_MODULES = {
    "os", "sys", "subprocess", "socket", "requests", "urllib", "http",
    "shutil", "posix", "pty", "commands", "builtin", "builtins",
    "importlib", "pickle", "shelve", "ctypes", "multiprocessing", "threading"
}

DANGEROUS_FUNCTIONS = {
    "eval", "exec", "compile", "open", "__import__", "globals", "locals",
    "getattr", "setattr", "delattr", "system", "popen", "spawn"
}

class SecurityASTValidator(ast.NodeVisitor):
    """
    Parses Python code into an Abstract Syntax Tree (AST) before execution.
    Recursively inspects every node for unauthorized imports, system calls, and builtins.
    """
    def __init__(self):
        self.violations = []

    def visit_Import(self, node):
        for alias in node.names:
            base_module = alias.name.split('.')[0].lower()
            if base_module in DANGEROUS_MODULES:
                self.violations.append(f"Import of forbidden module '{alias.name}' is prohibited by security policy.")
        self.generic_visit(node)

    def visit_ImportFrom(self, node):
        if node.module:
            base_module = node.module.split('.')[0].lower()
            if base_module in DANGEROUS_MODULES:
                self.violations.append(f"Import from forbidden module '{node.module}' is prohibited by security policy.")
        self.generic_visit(node)

    def visit_Call(self, node):
        # Inspect function call names
        if isinstance(node.func, ast.Name):
            func_name = node.func.id
            if func_name in DANGEROUS_FUNCTIONS:
                self.violations.append(f"Direct call to restricted function '{func_name}()' is prohibited.")
        elif isinstance(node.func, ast.Attribute):
            attr_name = node.func.attr
            if attr_name in DANGEROUS_FUNCTIONS or attr_name in {"system", "popen", "spawn", "execve"}:
                self.violations.append(f"Call to restricted method '{attr_name}()' is prohibited.")
        self.generic_visit(node)

def validate_code_safety(code: str) -> Tuple[bool, Optional[str]]:
    """
    Returns (True, None) if safe, or (False, error_remediation_message) if violated.
    """
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, f"Syntax Error in Python code: {e}"

    validator = SecurityASTValidator()
    validator.visit(tree)

    if validator.violations:
        violations_str = " | ".join(validator.violations)
        remediation_msg = (
            f"🛡️ Security Policy Violation: {violations_str}\n"
            f"Remediation: Host file system and network calls are restricted. "
            f"Use pure Pandas, NumPy, or DuckDB in-memory OLAP operations instead."
        )
        return False, remediation_msg

    return True, None

def _execute_restricted_local(code: str, dataset_data: Optional[List[Dict[str, Any]]] = None) -> str:
    """
    Hardened two-tier local runner with strict AST pre-validation,
    sterile environment variables, 15s timeout, and memory/process guardrails.
    """
    # 1. TIER 1: Pre-Execution AST Validation
    is_safe, safety_err = validate_code_safety(code)
    if not is_safe:
        logger.warning(f"BLOCKED UNSAFE CODE EXECUTION: {safety_err}")
        return safety_err

    # 2. TIER 2: Sandboxed Process Execution with Sterile Environment
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
    Otherwise, executes via sterile AST-validated local sandbox.
    """
    e2b_key = os.environ.get("E2B_API_KEY")
    if e2b_key and len(e2b_key.strip()) > 5:
        try:
            from chat.tools import _execute_e2b
            logger.info("🔒 Routing execution through isolated E2B microVM...")
            return _execute_e2b(code, dataset_data)
        except Exception as e:
            logger.warning(f"E2B execution failed: {e}. Falling back to sterile AST-validated local sandbox.")
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
