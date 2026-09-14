from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field, field_validator
from fastapi import UploadFile, File, Depends, HTTPException
from auth.security import get_current_active_user
from database.models import User
from cloud.storage import upload_dataset
import traceback

# Internal imports
from database import database, crud, models as db_models
from chat.agent import DataAnalystAgent
from auth.security import get_password_hash
from chat.db_tools import get_database_schema

router = APIRouter()


# =====================
# Request Schema
# =====================

class TitleRequest(BaseModel):
    message: str
    dataset_name: str | None = None
    columns: list[str] | None = None

@router.post("/title")
async def generate_title_endpoint(request: TitleRequest):
    # Strategy 3: Zero-Cost Title Generation (No AI API Calls)
    words = request.message.split()
    if len(words) <= 4:
        title = request.message
    else:
        title = " ".join(words[:4]) + "..."
    return {"title": title.title()}

class ChatRequest(BaseModel):
    message: str = Field(..., max_length=10000)
    dataset: list[dict] | None = None
    dataset_path: str | None = None  # S3 Path
    connection_string: str | None = None
    session_id: str = "default"

    @field_validator('dataset')
    @classmethod
    def validate_dataset_size(cls, v):
        if v and len(v) > 100_000:
            raise ValueError("Dataset too large. Maximum 100,000 rows allowed.")
        return v


# =====================
# Endpoint: /chat (router is included with prefix="/chat" in main.py)
# =====================
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
security_scheme = HTTPBearer(auto_error=False)

@router.post("/")
async def chat_endpoint(
    request: ChatRequest, 
    db: Session = Depends(database.get_db),
    token: HTTPAuthorizationCredentials | None = Depends(security_scheme)
):
    """
    Handles a user message, streams Gemini’s AI response, and returns it to the frontend.
    """
    try:
        user = None
        # Try to authenticate via JWT if provided
        if token:
            from auth.security import get_current_user
            try:
                user = await get_current_user(db=db, token=token.credentials)
            except Exception as e:
                print(f"Auth error (falling back to anonymous): {e}")
        
        # Fallback to anonymous user if no valid token
        if not user:
            user_email = "anonymous@datagem.ai"
            user = crud.get_user_by_email(db, user_email)

            if not user:
                from auth.security import get_password_hash
                hashed_password = get_password_hash("anonymous")
                new_user = db_models.User(
                    email=user_email,
                    hashed_password=hashed_password,
                    full_name="Anonymous User"
                )
                user = crud.create_user(db=db, user=new_user)

        # --- RATE LIMITING LOGIC ---
        from datetime import date
        today = date.today()
        
        # Reset counter if it's a new day
        if user.last_message_date != today:
            user.message_count = 0
            user.last_message_date = today
            db.commit()
            
        # Check tier limits
        tier_limits = {"free": 10, "pro": 100, "enterprise": 999999}
        user_tier = getattr(user, 'tier', 'free').lower()
        max_messages = tier_limits.get(user_tier, 10)
        
        if user.message_count >= max_messages:
            raise HTTPException(status_code=429, detail=f"Daily message limit ({max_messages}) reached for {user_tier} tier. Please upgrade to continue.")
            
        # Increment counter
        user.message_count += 1
        db.commit()
        # ---------------------------

        # ✅ Initialize AI agent
        if request.dataset:
            print(f"📊 Dataset received: {len(request.dataset)} rows, columns: {list(request.dataset[0].keys()) if request.dataset else 'N/A'}")
        else:
            print("⚠️ No dataset provided in request")
        
        agent = DataAnalystAgent(db=db, user=user, dataset=request.dataset, connection_string=request.connection_string, session_id=request.session_id)

        # ✅ Define async stream generator
        async def event_stream():
            try:
                async for token in agent.stream_response(request.message):
                    yield token
            except Exception as stream_err:
                print("❌ Error while streaming response:")
                traceback.print_exc()
                yield f"\n[Stream Error] {str(stream_err)}"

        # ✅ Return streaming response
        return StreamingResponse(event_stream(), media_type="text/plain")

    except Exception as e:
        print("❌ Error in /chat endpoint:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat endpoint failed: {str(e)}")

@router.post("/upload")
async def upload_dataset_endpoint(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user)
):
    """Uploads a CSV to Supabase S3"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    result = upload_dataset(file, current_user.id)
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error"))
        
    # For DuckDB out-of-core, we pass the URL (if S3) or absolute path (if local) as the 'path'
    duckdb_path = result["url"] if result["url"].startswith("http") else result["path"]
    
    # Generate an instant dataset profile using DuckDB!
    try:
        import duckdb
        conn = duckdb.connect(database=':memory:')
        if duckdb_path.startswith('http'):
            conn.execute('INSTALL httpfs; LOAD httpfs;')
        
        describe_df = conn.execute(f"DESCRIBE SELECT * FROM read_csv_auto('{duckdb_path}')").df()
        columns = describe_df['column_name'].tolist()
        types = describe_df['column_type'].tolist()
        
        row_count = conn.execute(f"SELECT COUNT(*) FROM read_csv_auto('{duckdb_path}')").fetchone()[0]
        
        # Calculate duplicates (if dataset is small enough to not OOM or take forever)
        # We'll just do a quick count of distinct rows
        distinct_count = conn.execute(f"SELECT COUNT(*) FROM (SELECT DISTINCT * FROM read_csv_auto('{duckdb_path}'))").fetchone()[0]
        duplicates = row_count - distinct_count
        
        profile = {
            "columns": [{"name": c, "type": t} for c, t in zip(columns, types)],
            "rows": row_count,
            "duplicates": duplicates
        }
    except Exception as e:
        print(f"Error profiling dataset: {e}")
        profile = {"columns": [], "rows": "Unknown", "duplicates": "Unknown"}
        
    return {"path": duckdb_path, "url": result["url"], "profile": profile}
