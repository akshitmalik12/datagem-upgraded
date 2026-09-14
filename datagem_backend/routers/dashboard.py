from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import database, models
from auth.auth import get_current_active_user
from database.models import User
from pydantic import BaseModel
from typing import List, Dict, Any

router = APIRouter()

class ChartCreate(BaseModel):
    title: str
    plotly_json: str

@router.post("/charts")
def save_chart(
    chart: ChartCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_chart = models.SavedChart(
        user_id=current_user.id,
        title=chart.title,
        plotly_json=chart.plotly_json
    )
    db.add(db_chart)
    db.commit()
    db.refresh(db_chart)
    return {"success": True, "id": db_chart.id}

@router.get("/charts")
def get_charts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    charts = db.query(models.SavedChart).filter(models.SavedChart.user_id == current_user.id).order_by(models.SavedChart.created_at.desc()).all()
    # Return as list of dicts
    return [{
        "id": c.id,
        "title": c.title,
        "plotly_json": c.plotly_json,
        "created_at": c.created_at.isoformat()
    } for c in charts]

@router.delete("/charts/{chart_id}")
def delete_chart(
    chart_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    db_chart = db.query(models.SavedChart).filter(models.SavedChart.id == chart_id, models.SavedChart.user_id == current_user.id).first()
    if not db_chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    db.delete(db_chart)
    db.commit()
    return {"success": True}
