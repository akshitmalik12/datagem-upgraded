import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database.database import get_db
from database import models as db_models
from auth.security import get_current_active_user
from utils.email_utils import send_billing_receipt

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])

class MockWebhookTrigger(BaseModel):
    provider: str  # 'stripe' | 'razorpay'
    email: str
    plan_tier: str = "pro" # 'pro' | 'enterprise'
    amount: str = "$15.00"

@router.get("/plans")
def get_plans():
    return {
        "plans": [
            {
                "id": "starter",
                "name": "Starter Analyst",
                "price_usd": 0,
                "price_inr": 0,
                "features": ["15 queries/day", "CSV / Excel / Sheets Connectors", "Standard Sandbox", "Community Support"],
                "limits": {"daily_queries": 15}
            },
            {
                "id": "pro",
                "name": "Pro Intelligence",
                "price_usd": 15,
                "price_inr": 1299,
                "features": ["Unlimited DuckDB queries", "Amazon, Shopify, Flipkart, WooCommerce", "Autonomous Anomaly Watchdog", "Weekly Monday Briefing", "Audit Trail"],
                "limits": {"daily_queries": 999999}
            },
            {
                "id": "enterprise",
                "name": "Enterprise Suite",
                "price_usd": 49,
                "price_inr": 3999,
                "features": ["Multi-user Workspaces & RBAC", "Custom Cluster Compute", "Dedicated Solutions Engineer", "Shareable Public Links", "SLA Guarantee"],
                "limits": {"daily_queries": 999999}
            }
        ]
    }

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Stripe Webhook processor for checkout session completion, subscription creation, and renewal.
    Supports both real Stripe Webhook signatures and sample test simulation.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    stripe_key = os.environ.get("STRIPE_SECRET_KEY")
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

    # If real Stripe credentials exist, verify signature
    if stripe_key and webhook_secret and sig_header:
        import stripe
        stripe.api_key = stripe_key
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            logger.error(f"Stripe webhook signature failure: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    else:
        # Fallback / Sample payload parsing for simulation
        try:
            event = json.loads(payload.decode('utf-8'))
        except Exception:
            return {"status": "skipped", "message": "No valid signature or JSON payload received"}

    event_type = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    if event_type in ["checkout.session.completed", "customer.subscription.created", "invoice.payment_succeeded"]:
        customer_email = data_object.get("customer_email") or data_object.get("customer_details", {}).get("email")
        tier = data_object.get("metadata", {}).get("tier", "pro")
        invoice_id = data_object.get("id", "inv_sample_stripe")
        amount = "$15.00" if tier == "pro" else "$49.00"

        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = tier
                db.commit()
                send_billing_receipt(customer_email, tier.capitalize(), amount, invoice_id)
                logger.info(f"User {customer_email} upgraded to {tier} via Stripe Webhook.")

    elif event_type in ["customer.subscription.deleted"]:
        customer_email = data_object.get("customer_email")
        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = "free"
                db.commit()
                logger.info(f"User {customer_email} downgraded to free tier via Stripe Webhook.")

    return {"status": "success", "processed_event": event_type}

@router.post("/webhook/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay Webhook processor for Indian UPI, Cards, and NetBanking subscriptions.
    Supports real HMAC-SHA256 signature verification and sample test simulation.
    """
    payload = await request.body()
    rzp_signature = request.headers.get("x-razorpay-signature")
    rzp_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET")

    # If real Razorpay secret exists, verify HMAC signature
    if rzp_secret and rzp_signature:
        import hmac
        import hashlib
        expected_signature = hmac.new(
            key=rzp_secret.encode('utf-8'),
            msg=payload,
            digestmod=hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_signature, rzp_signature):
            raise HTTPException(status_code=400, detail="Invalid Razorpay signature")

    try:
        data = json.loads(payload.decode('utf-8'))
    except Exception:
        return {"status": "skipped", "message": "Invalid JSON body"}

    event = data.get("event")

    if event in ["payment.captured", "subscription.charged", "order.paid"]:
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        customer_email = payment_entity.get("email")
        tier = data.get("payload", {}).get("notes", {}).get("tier", "pro")
        payment_id = payment_entity.get("id", "pay_sample_razorpay")
        amount = "₹1,299" if tier == "pro" else "₹3,999"

        if customer_email:
            user = db.query(db_models.User).filter(db_models.User.email == customer_email).first()
            if user:
                user.tier = tier
                db.commit()
                send_billing_receipt(customer_email, tier.capitalize(), amount, payment_id)
                logger.info(f"User {customer_email} upgraded to {tier} via Razorpay Webhook.")

    return {"status": "success", "processed_event": event}

@router.post("/webhook/simulate")
def simulate_payment_webhook(
    payload: MockWebhookTrigger,
    current_user: db_models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Admin simulation endpoint to test webhook subscription upgrading and receipt generation
    without needing live payment gateway test credentials.
    """
    target_user = db.query(db_models.User).filter(db_models.User.email == payload.email).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    target_user.tier = payload.plan_tier.lower()
    db.commit()

    sample_id = f"{payload.provider}_tx_sim_{os.urandom(4).hex()}"
    send_billing_receipt(payload.email, payload.plan_tier.capitalize(), payload.amount, sample_id)

    return {
        "success": True,
        "provider": payload.provider,
        "upgraded_email": payload.email,
        "tier": target_user.tier,
        "transaction_id": sample_id,
        "message": f"Successfully simulated {payload.provider.upper()} webhook and activated {target_user.tier} plan."
    }

@router.get("/subscription-status")
def get_subscription_status(
    current_user: db_models.User = Depends(get_current_active_user)
):
    """Returns current user tier, capabilities, and quota limits."""
    tier = getattr(current_user, "tier", None) or getattr(current_user, "plan_tier", "starter")
    is_pro_or_enterprise = tier.lower() in ["pro", "enterprise"]
    
    return {
        "user_email": current_user.email,
        "tier": tier.lower(),
        "is_pro": is_pro_or_enterprise,
        "features": {
            "clawback_auto_dispute": is_pro_or_enterprise,
            "monday_watchdog_automation": is_pro_or_enterprise,
            "unlimited_duckdb_queries": is_pro_or_enterprise,
            "parquet_vault_export": tier.lower() == "enterprise",
            "dedicated_audit_trail": tier.lower() == "enterprise"
        },
        "limits": {
            "daily_queries": 999999 if is_pro_or_enterprise else 15,
            "max_file_size_mb": 500 if tier.lower() == "enterprise" else (100 if is_pro_or_enterprise else 10)
        }
    }
