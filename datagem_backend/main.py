from services import watchdog
from routers import ecommerce_connectors
from dotenv import load_dotenv
load_dotenv(override=True)
import logging
import os
import uvicorn
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from database.database import engine, Base
from database import models as db_models
from chat import chat
from auth import auth
from routers import admin
from routers import dashboard
from routers import billing
from routers import ecommerce
import data_import

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Non-blocking schema initialization with graceful timeout
    try:
        logger.info("Initializing database schema...")
        db_models.Base.metadata.create_all(bind=engine)
        logger.info("Database schema initialized successfully.")
    except Exception as e:
        logger.error(f"Non-fatal database connection warning during startup: {e}. Running in resilient mode.")
    yield

app = FastAPI(
    title="DataGem AI Analyst Backend",
    description="Enterprise API for DataGem: AI-driven data intelligence, secure zero-trust sandboxing, and automated metric monitors.",
    version="2.0.0",
    lifespan=lifespan
)

class CORSOptionsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "")
        # Allow requests from production Vercel apps, datagem.app, and localhost
        allowed_origins = [
            "https://www.datagem.app",
            "https://datagem.app",
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5188",
            "http://127.0.0.1:5173"
        ]
        
        is_allowed = (
            origin in allowed_origins or
            origin.endswith(".vercel.app") or
            origin.startswith("http://localhost:") or
            origin.startswith("http://127.0.0.1:")
        )

        if request.method == "OPTIONS":
            response = Response()
            if is_allowed:
                response.headers["Access-Control-Allow-Origin"] = origin
            else:
                response.headers["Access-Control-Allow-Origin"] = "https://www.datagem.app"
            
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept, Origin, X-Requested-With"
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Max-Age"] = "3600"
            return response
        
        response = await call_next(request)
        if is_allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Cache-Control"] = "no-cache"
            response.headers["X-Accel-Buffering"] = "no"
        return response

app.add_middleware(CORSOptionsMiddleware)

# Register Routers
app.include_router(chat.router, prefix="/chat", tags=["Chat & Intelligence"])
app.include_router(auth.router, prefix="/auth", tags=["Auth & Users"])
app.include_router(billing.router, tags=["Billing & Subscriptions"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(data_import.router, prefix="/import", tags=["Data Import"])
app.include_router(ecommerce.router, prefix="/ecommerce", tags=["E-Commerce Marketplaces"])
app.include_router(ecommerce_connectors.router)
app.include_router(watchdog.router)



@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "product": "DataGem 2.0", "engine": "DuckDB + Gemini Flash"}

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to DataGem AI Analyst API. Visit /docs for OpenAPI specs."}

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    reload_dirs = [
        os.path.join(current_dir, "chat"),
        os.path.join(current_dir, "database"),
        os.path.join(current_dir, "auth"),
        os.path.join(current_dir, "routers"),
    ]
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        reload_dirs=reload_dirs,
        reload_includes=["*.py"]
    )
