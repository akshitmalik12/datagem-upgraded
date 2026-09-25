import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import random
import string
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
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

@router.post("/signup", response_model=auth_models.UserInDB)
def create_new_user(user: auth_models.UserCreate, db: Session = Depends(database.get_db)):
    """Create a new user account."""
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # --- THIS IS THE FIX ---
    # We scramble the password here, *before* sending it to crud.py
    hashed_password = security.get_password_hash(user.password)
    db_user = db_models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name  # This uses the 'full_name' field
    )
    # --- END FIX ---
    
    created_user = crud.create_user(db=db, user=db_user)
    
    # Send a beautiful Welcome Email via SMTP
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    if sender_email and sender_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Welcome to DataGem, {user.full_name or 'Data Explorer'}! 💎"
            msg["From"] = sender_email
            msg["To"] = created_user.email
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0F19; padding: 40px 20px; margin: 0; -webkit-font-smoothing: antialiased;">
                <div style="max-width: 550px; margin: 0 auto; background: #151B2B; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
                    <div style="padding: 40px; text-align: center; border-bottom: 1px solid #1F2937;">
                        <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">DataGem <span style="color: #6366F1;">💎</span></h1>
                    </div>
                    <div style="padding: 40px;">
                        <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0;">Welcome aboard, {user.full_name or 'Explorer'}!</h2>
                        <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                            Your AI-powered data analyst is ready. Say goodbye to complex SQL and hello to instantaneous insights, interactive charts, and intelligent reporting.
                        </p>
                        <div style="background: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                            <h3 style="color: #E5E7EB; font-size: 16px; font-weight: 600; margin-top: 0; margin-bottom: 12px;">Unlock the Full Power of DataGem</h3>
                            <p style="color: #9CA3AF; font-size: 15px; margin: 0 0 15px 0; line-height: 1.6;">
                                You are currently on the Free tier. Want to handle massive datasets and unlock unlimited AI chats?
                            </p>
                            <div style="text-align: center;">
                                <a href="https://datagem.app/pricing" style="display: inline-block; background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); color: #ffffff; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4); margin-right: 10px;">🚀 Upgrade to Pro</a>
                                <a href="https://datagem.app/pricing" style="display: inline-block; background: transparent; border: 1px solid #4F46E5; color: #6366F1; font-weight: 600; font-size: 14px; text-decoration: none; padding: 10px 20px; border-radius: 6px;">💼 View Enterprise</a>
                            </div>
                        </div>
                        <div style="text-align: center;">
                            <a href="https://datagem.app/chat" style="display: inline-block; background: #111827; color: #ffffff; font-weight: 600; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 8px; border: 1px solid #374151;">Open Workspace</a>
                        </div>
                    </div>
                    <div style="padding: 24px 40px; background: #0F131F; text-align: center;">
                        <p style="color: #6B7280; font-size: 12px; margin: 0;">&copy; 2026 DataGem. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            part2 = MIMEText(html_content, "html")
            msg.attach(part2)
            
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, created_user.email, msg.as_string())
            server.quit()
            print(f"✅ Successfully sent welcome email to {created_user.email}")
        except Exception as e:
            print(f"❌ Failed to send welcome email: {e}")
    else:
        print("⚠️ SMTP credentials missing. Welcome email printed to console instead.")
        print(f"🚀 SENDING WELCOME EMAIL TO: {created_user.email}")
    
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
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        # Prevent email enumeration by returning a generic success message
        return {"message": "If that email exists, an OTP has been sent."}
        
    # Generate 6-digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store OTP (expires in 15 minutes)
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    db_reset = db_models.PasswordReset(email=request.email, otp=otp, expires_at=expires_at)
    db.add(db_reset)
    db.commit()
    
    # Send OTP via SMTP if configured
    sender_email = os.getenv("SMTP_EMAIL")
    sender_password = os.getenv("SMTP_PASSWORD")
    
    if sender_email and sender_password:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "Your DataGem Password Reset OTP 🔐"
            msg["From"] = sender_email
            msg["To"] = request.email
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
            <meta name="color-scheme" content="light dark">
            <meta name="supported-color-schemes" content="light dark">
            <style>
              :root {{ color-scheme: light dark; supported-color-schemes: light dark; }}
            </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #0B0F19;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0B0F19" style="background-color: #0B0F19; min-width: 100%; width: 100%;">
                    <tr>
                        <td align="center" style="padding: 40px 20px; background-color: #0B0F19;">
                            <table width="100%" max-width="550" cellpadding="0" cellspacing="0" border="0" style="max-width: 550px; background-color: #151B2B; border: 1px solid #1F2937; border-radius: 16px; overflow: hidden; margin: 0 auto;">
                                <tr>
                                    <td align="center" style="padding: 40px; border-bottom: 1px solid #1F2937;">
                                        <h1 style="color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">DataGem <span style="color: #6366F1;">Security</span></h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 40px; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">
                                        <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0;">Password Reset Request</h2>
                                        <p style="color: #9CA3AF; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                            We received a request to reset your password. Use the secure authorization code below to complete the process.
                                        </p>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0F131F; border: 1px solid #1F2937; border-radius: 12px; margin-bottom: 30px;">
                                            <tr>
                                                <td align="center" style="padding: 30px;">
                                                    <p style="color: #6B7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-top: 0; margin-bottom: 12px; font-weight: 600; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif;">Your Authorization Code</p>
                                                    <div style="color: #ffffff; font-size: 36px; font-weight: 800; letter-spacing: 8px; font-family: monospace;">{otp}</div>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin-bottom: 0;">
                                            This code is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """
            msg.attach(MIMEText(html_content, "html"))
            
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, request.email, msg.as_string())
            server.quit()
            print(f"✅ Successfully sent OTP email to {request.email}")
        except Exception as e:
            print(f"❌ Failed to send OTP email: {e}")
    else:
        print(f"\n============================")
        print(f"🔐 PASSWORD RESET OTP: {otp}")
        print(f"📧 FOR EMAIL: {request.email}")
        print(f"============================\n")
    
    return {"message": "If that email exists, an OTP has been sent."}

@router.post("/verify-otp")
def verify_otp(request: auth_models.VerifyOTPRequest, db: Session = Depends(database.get_db)):
    # Find active OTP
    reset_record = db.query(db_models.PasswordReset).filter(
        db_models.PasswordReset.email == request.email,
        db_models.PasswordReset.otp == request.otp,
        db_models.PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    return {"message": "OTP verified successfully"}

@router.post("/reset-password")
def reset_password(request: auth_models.ResetPasswordRequest, db: Session = Depends(database.get_db)):
    # Find active OTP
    reset_record = db.query(db_models.PasswordReset).filter(
        db_models.PasswordReset.email == request.email,
        db_models.PasswordReset.otp == request.otp,
        db_models.PasswordReset.expires_at > datetime.utcnow()
    ).first()
    
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
    # Update password
    user = crud.get_user_by_email(db, email=request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = security.get_password_hash(request.new_password)
    
    # Delete the used OTP
    db.delete(reset_record)
    db.commit()
    
    return {"message": "Password has been reset successfully"}

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
