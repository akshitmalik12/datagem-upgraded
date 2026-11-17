import os
import smtplib
import logging
import httpx
from email.message import EmailMessage

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "support@datagem.app")

def send_transactional_email(to_email: str, subject: str, html_content: str, text_content: str = ""):
    """
    Dual-engine transactional email sender:
    1. Primary: Resend API (HTTP, 99.9% deliverability)
    2. Fallback: SMTP / Gmail SSL
    """
    # 1. Attempt Resend API
    if RESEND_API_KEY:
        try:
            with httpx.Client(timeout=10.0) as client:
                res = client.post(
                    "https://api.resend.com/emails",
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "from": f"DataGem <{SENDER_EMAIL}>",
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content,
                        "text": text_content or subject
                    }
                )
                if res.status_code in [200, 201]:
                    logger.info(f"Email sent via Resend API to {to_email}")
                    return True
                else:
                    logger.warning(f"Resend API returned {res.status_code}: {res.text}. Falling back to SMTP.")
        except Exception as e:
            logger.warning(f"Resend API exception: {e}. Falling back to SMTP.")

    # 2. Fallback: SMTP
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    if not smtp_email or not smtp_password:
        logger.info(f"[SIMULATED EMAIL] To: {to_email} | Subject: {subject}")
        return True

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"DataGem <{smtp_email}>"
    msg["To"] = to_email
    msg.set_content(text_content or subject)
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            logger.info(f"Email sent via SMTP to {to_email}")
            return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
        return False

def send_welcome_email(user_email: str, user_name: str = ""):
    name = user_name or "Operator"
    subject = "Welcome to DataGem! 💎 Audit your e-commerce data in 60s"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #1E293B;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 36px;">💎</span>
        <h1 style="color: #FFFFFF; font-size: 24px; margin: 8px 0;">Welcome to DataGem, {name}!</h1>
        <p style="color: #94A3B8; font-size: 14px;">Your AI-Powered In-Memory Analytics Workspace</p>
      </div>
      <div style="background: #0F172A; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #334155;">
        <h3 style="color: #38BDF8; margin-top: 0; font-size: 16px;">Quick Start in 3 Steps:</h3>
        <ul style="color: #CBD5E1; font-size: 13px; line-height: 1.8; padding-left: 20px;">
          <li><strong>Step 1:</strong> Connect Amazon, Shopify, or upload a sales CSV.</li>
          <li><strong>Step 2:</strong> Ask natural language questions like <em>"What is my fee leakage by SKU?"</em></li>
          <li><strong>Step 3:</strong> Export interactive Plotly charts directly to your team.</li>
        </ul>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://www.datagem.app/chat" style="display: inline-block; background: #4F46E5; color: #FFFFFF; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Open Your Workspace →</a>
        </div>
      </div>
      <p style="color: #64748B; font-size: 11px; text-align: center; margin-top: 24px;">© 2026 DataGem. Zero-token in-memory analytics engine.</p>
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_trial_limit_warning(user_email: str, queries_left: int = 2):
    subject = "⚠️ You have 2 queries left on your DataGem Free Plan"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #1E293B;">
      <h2 style="color: #F59E0B; margin-top: 0;">Trial Limit Approaching</h2>
      <p style="color: #CBD5E1; font-size: 14px;">You have <strong>{queries_left} queries left</strong> for today on your free sandbox tier.</p>
      <div style="background: #0F172A; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
        <h4 style="color: #FFFFFF; margin-top: 0;">Upgrade to Pro ($15/mo) to unlock:</h4>
        <ul style="color: #94A3B8; font-size: 13px; line-height: 1.6;">
          <li>Unlimited DuckDB Vectorized Queries</li>
          <li>Multichannel Live Connectors (Amazon, Shopify, Flipkart, WooCommerce)</li>
          <li>Automated Monday 8 AM Executive Digest</li>
        </ul>
        <a href="https://www.datagem.app/pricing" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Upgrade to Pro ($15/mo) →</a>
      </div>
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_weekly_executive_digest(user_email: str, gmv: str, payout: str, fee_leakage: str, top_sku: str):
    subject = "📊 Your Monday Executive Briefing — DataGem"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #1E293B;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1E293B; padding-bottom: 16px;">
        <h2 style="color: #FFFFFF; margin: 0;">Weekly Store Briefing</h2>
        <span style="background: #10B981; color: #000000; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 4px;">AUTOMATED</span>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 24px 0;">
        <div style="background: #0F172A; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
          <div style="color: #94A3B8; font-size: 11px;">7-DAY GROSS GMV</div>
          <div style="color: #FFFFFF; font-size: 20px; font-weight: bold; margin-top: 4px;">{gmv}</div>
        </div>
        <div style="background: #0F172A; padding: 16px; border-radius: 8px; border: 1px solid #334155;">
          <div style="color: #94A3B8; font-size: 11px;">NET PAYOUT SETTLEMENT</div>
          <div style="color: #10B981; font-size: 20px; font-weight: bold; margin-top: 4px;">{payout}</div>
        </div>
      </div>
      <div style="background: #1E1B4B; padding: 16px; border-radius: 8px; border: 1px solid #4338CA; margin-bottom: 20px;">
        <div style="color: #A5B4FC; font-size: 12px;">Top Performer: <strong>{top_sku}</strong></div>
        <div style="color: #F87171; font-size: 12px; margin-top: 4px;">Identified Fee Leakage: <strong>{fee_leakage}</strong></div>
      </div>
      <div style="text-align: center;">
        <a href="https://www.datagem.app/chat" style="display: inline-block; background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: bold;">Launch Full Drilldown in Studio →</a>
      </div>
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_anomaly_alert(user_email: str, alert_type: str, details: str, recommended_action: str):
    subject = f"🚨 Watchdog Alert: {alert_type}"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #EF4444;">
      <h2 style="color: #EF4444; margin-top: 0;">Watchdog Anomaly Detected</h2>
      <p style="color: #FCA5A5; font-size: 14px; font-weight: bold;">{alert_type}</p>
      <div style="background: #1C1917; padding: 16px; border-radius: 8px; border: 1px solid #44403C; margin: 16px 0; font-size: 13px; color: #E7E5E4;">
        {details}
      </div>
      <div style="background: #0F172A; padding: 16px; border-radius: 8px; border: 1px solid #334155; font-size: 13px; color: #94A3B8;">
        <strong>Recommended Action:</strong> {recommended_action}
      </div>
      <div style="text-align: center; margin-top: 20px;">
        <a href="https://www.datagem.app/chat" style="display: inline-block; background: #EF4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">Review Discrepancy →</a>
      </div>
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_billing_receipt(user_email: str, plan_name: str, amount: str, invoice_id: str):
    subject = f"💎 DataGem {plan_name} Subscription Confirmation & Receipt"
    html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #1E293B;">
      <h2 style="color: #10B981; margin-top: 0;">Payment Successful</h2>
      <p style="color: #CBD5E1; font-size: 14px;">Thank you for subscribing to <strong>DataGem {plan_name}</strong>!</p>
      <div style="background: #0F172A; padding: 20px; border-radius: 12px; border: 1px solid #334155; margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #94A3B8;">
          <span>Invoice ID:</span>
          <span style="color: #FFFFFF; font-family: monospace;">{invoice_id}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #94A3B8;">
          <span>Plan:</span>
          <span style="color: #FFFFFF; font-weight: bold;">{plan_name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; color: #94A3B8; border-top: 1px solid #334155; padding-top: 8px;">
          <span>Total Paid:</span>
          <span style="color: #10B981; font-weight: bold;">{amount}</span>
        </div>
      </div>
      <p style="color: #64748B; font-size: 12px;">You now have unrestricted access to in-memory DuckDB analytics, live marketplace connectors, and priority support.</p>
    </div>
    """
    return send_transactional_email(user_email, subject, html)
