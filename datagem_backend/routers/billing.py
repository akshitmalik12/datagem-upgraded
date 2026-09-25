from dotenv import load_dotenv
load_dotenv()

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import razorpay
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


from database import models
from database.database import get_db
from auth.security import get_current_active_user

router = APIRouter()

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_dummy_key")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "dummy_secret")

# Only initialize if actual keys are provided, otherwise provide a dummy for testing
try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except:
    razorpay_client = None

class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str
    tier: str

class CreateOrderRequest(BaseModel):
    tier: str

@router.post("/create-order")
def create_order(req: CreateOrderRequest, current_user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Create a Razorpay order for the requested tier"""
    target_tier = req.tier.lower()
    if current_user.tier == target_tier:
        raise HTTPException(status_code=400, detail=f"User is already on the {target_tier} tier")
    
    amount = 999 * 100 if target_tier == "pro" else 4999 * 100 # Default to Enterprise

    currency = "INR"
    
    if RAZORPAY_KEY_ID == "rzp_test_dummy_key" or not razorpay_client:
        # Mock order for when keys aren't set
        order = {"id": "order_mock_123456", "amount": amount, "currency": currency}
    else:
        try:
            order = razorpay_client.order.create({
                "amount": amount,
                "currency": currency,
                "receipt": f"receipt_{current_user.id}"
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    current_user.razorpay_order_id = order["id"]
    db.commit()
    
    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": currency,
        "key_id": RAZORPAY_KEY_ID,
        "user_name": current_user.full_name,
        "user_email": current_user.email
    }

@router.post("/verify")
def verify_payment(req: VerifyPaymentRequest, current_user: models.User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """Verify Razorpay payment signature and upgrade tier"""
    
    if RAZORPAY_KEY_ID == "rzp_test_dummy_key" or not razorpay_client:
        # Accept mock payment for testing
        is_valid = True
    else:
        try:
            # Verify signature
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': req.razorpay_order_id,
                'razorpay_payment_id': req.razorpay_payment_id,
                'razorpay_signature': req.razorpay_signature
            })
            is_valid = True
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid payment signature: {str(e)}")
            
    if is_valid:
        # Upgrade user
        tier_name = req.tier.lower()
        current_user.tier = tier_name
        current_user.razorpay_payment_id = req.razorpay_payment_id
        db.commit()
        
        # SEND WELCOME EMAIL
        sender_email = os.getenv("SMTP_EMAIL")
        sender_password = os.getenv("SMTP_PASSWORD")
        
        features_list = ""
        if tier_name == "enterprise":
            features_list = """
                <li><b>Custom LLM Models:</b> Use your own fine-tuned models for maximum privacy.</li>
                <li><b>Dedicated Database Sandboxing:</b> Uncapped compute in fully isolated Docker environments.</li>
                <li><b>SLA 99.99%:</b> Guaranteed uptime for mission-critical operations.</li>
                <li><b>White-label Reports:</b> Remove DataGem branding from all exports.</li>
            """
        else:
            features_list = """
                <li><b>Advanced Analytics:</b> Access to Gemini 1.5 Pro for deep reasoning tasks.</li>
                <li><b>Export to Jupyter:</b> Download your sessions as fully executable Python notebooks.</li>
                <li><b>Multiple Integrations:</b> Connect to PostgreSQL, Snowflake, and Google Sheets simultaneously.</li>
                <li><b>Priority Support:</b> Jump the queue for any troubleshooting.</li>
            """

        if sender_email and sender_password:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"Welcome to DataGem {tier_name.capitalize()}! 🚀"
                msg["From"] = sender_email
                msg["To"] = current_user.email
                
                html_content = f"""
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #0B0F19; color: #fff; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto; background: #151B2B; border-radius: 12px; padding: 30px;">
                        <h1 style="color: #6366F1;">Welcome to DataGem {tier_name.capitalize()}!</h1>
                        <p>Hi {current_user.full_name or 'there'},</p>
                        <p>Thank you for upgrading! Your account has been instantly activated on the <b>{tier_name.capitalize()}</b> plan.</p>
                        <h3>Here are the top features you can try out right now:</h3>
                        <ul>
                            {features_list}
                        </ul>
                        <br/>
                        <p>Happy querying!</p>
                        <p>- The DataGem Team</p>
                    </div>
                </body>
                </html>
                """
                msg.attach(MIMEText(html_content, "html"))
                
                with smtplib.SMTP("smtp.gmail.com", 587) as server:
                    server.starttls()
                    server.login(sender_email, sender_password)
                    server.send_message(msg)
            except Exception as e:
                print(f"Warning: Failed to send welcome email: {e}")
        else:
            print(f"\n--- MOCK EMAIL --- \nSubject: Welcome to DataGem {tier_name.capitalize()}!\nTo: {current_user.email}\nFeatures:\n{features_list}\n------------------\n")

        return {"success": True, "message": f"Successfully upgraded to {tier_name.capitalize()} tier!", "tier": tier_name}
