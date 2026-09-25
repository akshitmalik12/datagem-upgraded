from dotenv import load_dotenv
load_dotenv(override=True)
import logging
import uvicorn
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from database.database import engine, Base
from database import models as db_models
from chat import chat
from auth import auth
from routers import admin
from routers import billing
from routers import dashboard
import data_import

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create all the database tables
# This command looks at your db_models.py and creates
# the "users" and "chat_history" tables in your database.
db_models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DataGem AI Analyst Backend",
    description="API for the DataGem project, handling user auth, chat, and AI analysis.",
    version="1.0.0"
)

# Custom middleware to handle OPTIONS requests BEFORE FastAPI routing
class CORSOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "*")
        
        if request.method == "OPTIONS":
            response = Response()
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "86400"
            return response
            
        response = await call_next(request)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Cache-Control"] = "no-cache"
        response.headers["X-Accel-Buffering"] = "no"
        return response

# Add our custom middleware - this MUST be added LAST so it runs FIRST
# (Middleware runs in reverse order - last added = first executed)
app.add_middleware(CORSOptionsMiddleware)

# "Plug in" the routers from your other folders
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(billing.router, prefix="/billing", tags=["Billing"])
app.include_router(data_import.router, prefix="/import", tags=["Import"])

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the DataGem AI Backend! Visit /docs for API details."}

# Standard entry point for running the app
if __name__ == "__main__":
    import os
    # Get the current directory (where main.py is located)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    venv_path = os.path.join(current_dir, "venv")
    
    # Only watch specific source directories - DO NOT include current_dir
    # because it contains venv which we want to exclude completely
    reload_dirs = [
        os.path.join(current_dir, "chat"),
        os.path.join(current_dir, "database"),
        os.path.join(current_dir, "auth"),
    ]
    
    # Use absolute paths for excludes to be more explicit
    reload_excludes = [
        # venv_path removed due to pathlib limitation
        "venv",
        "venv/**",
        "**/venv/**",
        "**/venv/lib/**",
        "**/venv/bin/**",
        "**/site-packages/**",
        "**/__pycache__/**",
        "**/*.pyc",
        "**/*.pyo",
        "**/.git/**",
    ]
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=reload_dirs,  # Only watch source code directories (not venv)
        reload_excludes=reload_excludes,
        reload_includes=["*.py"]  # Only watch Python files
    )
