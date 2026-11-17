from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from database import database, models

router = APIRouter(prefix="/admin-setup", tags=["Admin Setup"])

@router.post("/promote")
def promote_user(email: str, secret: str = Header(...), db: Session = Depends(database.get_db)):
    if secret != "super_datagem_admin_secret_2026":
        raise HTTPException(status_code=403, detail="Forbidden")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.tier = "enterprise"
    db.commit()
    return {"status": "promoted", "email": user.email, "tier": user.tier}
