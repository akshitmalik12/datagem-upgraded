from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import os
import psutil

from database import database, models
from auth.security import get_current_active_user

router = APIRouter()

@router.get("/telemetry")
async def get_telemetry(current_user: models.User = Depends(get_current_active_user), db: Session = Depends(database.get_db)):
    # Simple check to ensure only admins can access telemetry
    # (For demo purposes we allow 'enterprise' or the specific demo email)
    if current_user.tier.lower() != 'enterprise' and current_user.email != 'aakshitmalik@gmail.com':
        raise HTTPException(status_code=403, detail="Not authorized for telemetry")

    # 1. Total Users & Active Users
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == 1).count()

    # 2. Compute Queries (Total Chat Messages)
    total_queries = db.query(models.ChatHistory).count()

    # 3. MRR Calculation
    pro_users = db.query(models.User).filter(models.User.tier.ilike('pro')).count()
    enterprise_users = db.query(models.User).filter(models.User.tier.ilike('enterprise')).count()
    mrr = (pro_users * 15) + (enterprise_users * 49)

    # 4. Storage Used (Size of datagem.db for local demo)
    storage_bytes = 0
    db_path = "datagem.db"
    if os.path.exists(db_path):
        storage_bytes = os.path.getsize(db_path)
    # Convert to MB or GB (Mock a base of 40GB + actual size just to look cool if needed, 
    # but let's show real MB so the user knows it's real!)
    storage_mb = round(storage_bytes / (1024 * 1024), 2)
    storage_str = f"{storage_mb} MB"

    # 5. Cluster Health
    cpu_usage = psutil.cpu_percent(interval=0.1)
    memory = psutil.virtual_memory()
    ram_usage = memory.percent
    
    # Mocking Gemini Quota based on message volume
    rpm_exceeded = min(100, round((total_queries % 100) / 100 * 100))
    gemini_status = "Warning" if rpm_exceeded > 80 else "Healthy"
    gemini_color = "yellow" if gemini_status == "Warning" else "green"

    return {
        "totalUsers": total_users,
        "activeUsers": active_users,
        "totalQueries": total_queries,
        "mrr": f"${mrr:,.2f}",
        "storageUsed": storage_str,
        "clusterHealth": {
            "cpu": cpu_usage,
            "ram": ram_usage,
            "gemini": {
                "status": gemini_status,
                "color": gemini_color,
                "usage": rpm_exceeded
            }
        }
    }
