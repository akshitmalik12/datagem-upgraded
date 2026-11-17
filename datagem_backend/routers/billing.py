import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from database.database import get_db
from database import models as db_models
from auth.auth import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])

@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {
                "id": "starter",
                "name": "Starter Analyst",
                "price_usd": 29,
                "price_inr": 2499,
                "features": ["100 queries/day", "CSV / Excel / Sheets Connectors", "Standard Sandbox", "5 Scheduled Monitors"],
                "limits": {"daily_queries": 100, "monitors": 5}
            },
            {
                "id": "pro",
                "name": "Pro Intelligence",
                "price_usd": 79,
                "price_inr": 6499,
                "features": ["Unlimited queries", "Postgres + Stripe Connectors", "Zero-Trust E2B MicroVMs", "Unlimited Slack/Email Monitors", "Audit Trail"],
                "limits": {"daily_queries": 999999, "monitors": 100}
            }
        ]
    }

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Idempotent Stripe Webhook processor for subscription activation and cancellation."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    if not stripe_key or not webhook_secret:
        return {"status": "skipped", "message": "Stripe webhook secret not configured"}

    import stripe
    stripe.api_key = stripe_key
    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception as e:
        logger.error(f"Stripe webhook signature failure: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    event_type = event.get("type")
    data_object = event.get("data", {}).get("object", {})

    if event_type in ["checkout.session.completed", "customer.subscription.created", "invoice.payment_succeeded"]:
        customer_email = data_object.get("customer_email") or data_object.get("customer_details", {}).get("email")
        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = "pro"
                db.commit()
                logger.info(f"User {customer_email} upgraded to Pro via Stripe.")

    elif event_type in ["customer.subscription.deleted"]:
        customer_email = data_object.get("customer_email")
        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = "free"
                db.commit()
                logger.info(f"User {customer_email} downgraded to Free tier.")

    return {"status": "success"}

@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """Idempotent Razorpay Webhook processor for Indian UPI/Card subscriptions."""
    payload = await request.body()
    rzp_signature = request.headers.get("x-razorpay-signature")
    rzp_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET")

    if not rzp_secret or not rzp_signature:
        return {"status": "skipped", "message": "Razorpay webhook secret not configured"}

    import hmac
    import hashlib

    expected_signature = hmac.new(
        key=rzp_secret.encode('utf-8'),
        msg=payload,
        digestmod=hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, rzp_signature):
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    data = json.loads(payload.decode('utf-8'))
    event = data.get("event")

    if event in ["payment.captured", "subscription.charged"]:
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        customer_email = payment_entity.get("email")
        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = "pro"
                db.commit()
                logger.info(f"User {customer_email} upgraded to Pro via Razorpay.")

    return {"status": "success"}
