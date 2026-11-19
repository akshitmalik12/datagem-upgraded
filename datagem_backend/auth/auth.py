import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

# We use absolute imports (starting from the root)
from database import crud, database, models as db_models
from auth import models as auth_models
from auth import security
from auth.security import get_current_active_user, get_current_user
from database.models import User

router = APIRouter()

def is_admin_email(email: str) -> bool:
    if not email:
        return False
    return email.lower().strip() in ["aakshitmalik@gmail.com", "akshitmalik1203@gmail.com"]

@router.post("/signup", response_model=auth_models.UserInDB)
def create_new_user(
    user: auth_models.UserCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db)
):
    """Create a new user account."""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # We scramble the password here, *before* sending it to crud.py
    hashed_password = security.get_password_hash(user.password)
    # Assign tier: promote primary owner/admins to enterprise tier automatically
    initial_tier = "enterprise" if is_admin_email(user.email) else "free"

    db_user = db_models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        tier=initial_tier
    )
    
    created_user = crud.create_user(db=db, user=db_user)
    
    # Send non-blocking Welcome Email in background task (API returns in <50ms)
    try:
        from utils.email_utils import send_welcome_email
        background_tasks.add_task(
            send_welcome_email, 
            user_email=created_user.email, 
            user_name=created_user.full_name or "Operator"
        )
    except Exception as e:
        print(f"⚠️ Error scheduling background welcome email: {e}")
    
    return created_user


@router.post("/token", response_model=auth_models.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)
):
    """Log in a user and return a JWT access token."""
    user = crud.get_user_by_email(db, email=form_data.username) # username is the email
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Ensure primary admin accounts are always enterprise tier upon successful login
    if is_admin_email(user.email) and user.tier != "enterprise":
        user.tier = "enterprise"
        db.commit()

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login", response_model=auth_models.Token)
async def login_json(
    credentials: auth_models.UserLogin, db: Session = Depends(database.get_db)
):
    """Log in a user via JSON body and return a JWT access token."""
    user = crud.get_user_by_email(db, email=credentials.email)
    
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Ensure primary admin accounts are always enterprise tier upon successful login
    if is_admin_email(user.email) and user.tier != "enterprise":
        user.tier = "enterprise"
        db.commit()

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=auth_models.UserInDB)
async def read_users_me(
    current_user: db_models.User = Depends(security.get_current_active_user),
):
    """Test endpoint to check if a user's token is valid."""
    return current_user

import random
from datetime import datetime, timezone
import string

@router.post("/forgot-password")
def forgot_password(request: auth_models.ForgotPasswordRequest, db: Session = Depends(database.get_db)):
    clean_email = request.email.strip().lower()
    user = crud.get_user_by_email(db, email=clean_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account registered with this email address. Please check your spelling or sign up."
        )
        
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP (expires in 15 minutes)
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    db_reset = db_models.PasswordReset(email=clean_email, otp=otp, expires_at=expires_at)
    db.add(db_reset)
    db.commit()
    
    # Send OTP using our verified transactional email engine (Resend API)
    try:
        from utils.email_utils import send_password_reset_email
        sent = send_password_reset_email(clean_email, otp)
        if sent:
            print(f"✅ Successfully dispatched OTP verification email to {clean_email}")
        else:
            print(f"⚠️ Failed to send OTP email to {clean_email}")
    except Exception as e:
        print(f"⚠️ Failed to send OTP email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send OTP email: {str(e)}"
        )
    
    return {"message": "Verification OTP sent successfully to your email."}

@router.post("/verify-otp")
def verify_otp(request: auth_models.VerifyOTPRequest, db: Session = Depends(database.get_db)):
    from sqlalchemy import func
    clean_email = request.email.strip().lower()
    clean_otp = request.otp.strip()
    # Find active OTP
    reset_record = db.query(db_models.PasswordReset).filter(
        func.lower(func.trim(db_models.PasswordReset.email)) == clean_email,
        db_models.PasswordReset.otp == clean_otp,
        db_models.PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new code.")
        
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(request: auth_models.ResetPasswordRequest, db: Session = Depends(database.get_db)):
    from sqlalchemy import func
    clean_email = request.email.strip().lower()
    clean_otp = request.otp.strip()
    # Find active OTP
    reset_record = db.query(db_models.PasswordReset).filter(
        func.lower(func.trim(db_models.PasswordReset.email)) == clean_email,
        db_models.PasswordReset.otp == clean_otp,
        db_models.PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP. Please request a new code.")
        
    # Update password
    user = crud.get_user_by_email(db, email=clean_email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = security.get_password_hash(request.new_password)
    
    # Delete the used OTP
    db.delete(reset_record)
    db.commit()
    
    return {"message": "Password has been reset successfully. You can now log in."}

@router.post("/set-tier")
async def set_user_tier(
    email: str,
    tier: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if current_user.tier != "enterprise":
        raise HTTPException(status_code=403, detail="Only enterprise admins can change tiers")
    
    target_user = crud.get_user_by_email(db, email)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_user.tier = tier
    db.commit()
    return {"success": True, "message": f"User {email} updated to {tier} tier."}

@router.get("/users")
async def get_all_users(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if current_user.tier != "enterprise":
        raise HTTPException(status_code=403, detail="Only enterprise admins can view users")
    
    users = db.query(User).all()
    return [{
        "id": u.id,
        "email": u.email,
        "name": u.full_name,
        "tier": u.tier,
        "status": "Active",
        "storage": "0 MB"
    } for u in users]

@router.post("/suspend-user")
async def suspend_user(
    email: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    if current_user.tier != "enterprise":
        raise HTTPException(status_code=403, detail="Only enterprise admins can suspend users")
    
    target_user = crud.get_user_by_email(db, email)
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
        
    target_user.is_active = 0
    db.commit()
    return {"success": True, "message": f"User {email} suspended."}

from pydantic import BaseModel
class PromptUpdate(BaseModel):
    system_prompt: str

@router.put("/me/prompt")
def update_system_prompt(payload: PromptUpdate, current_user: db_models.User = Depends(get_current_active_user), db: Session = Depends(database.get_db)):
    user = db.query(db_models.User).filter(db_models.User.id == current_user.id).first()
    if user:
        user.system_prompt = payload.system_prompt
        db.commit()
        return {"status": "success"}
    raise HTTPException(status_code=404)
