import os
import smtplib
import logging
import httpx
from pathlib import Path
from email.message import EmailMessage
from jinja2 import Environment, select_autoescape, BaseLoader, Template

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "support@datagem.app")

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates" / "emails"

def render_template(template_name: str, context: dict) -> str:
    """Renders a Jinja2 email template safely with fallback."""
    try:
        template_path = TEMPLATES_DIR / template_name
        if template_path.exists():
            with open(template_path, 'r', encoding='utf-8') as f:
                template_str = f.read()
            template = Template(template_str)
            return template.render(**context)
    except Exception as e:
        logger.warning(f"Failed to render Jinja2 template {template_name}: {e}")
    
    # Fallback minimal HTML
    return f"<div><p>DataGem Notification</p><pre>{context}</pre></div>"

def send_transactional_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Dual-engine non-blocking transactional email sender:
    1. Primary: Resend API (HTTP REST, 99.9% deliverability)
    2. Fallback: SMTP / Gmail SSL
    """
    # 1. Attempt Resend API
    if RESEND_API_KEY:
        try:
            with httpx.Client(timeout=8.0) as client:
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
        logger.info(f"[SIMULATED EMAIL DISPATCH] To: {to_email} | Subject: {subject}")
        return True

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"DataGem <{smtp_email}>"
    msg["To"] = to_email
    msg.set_content(text_content or subject)
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10.0) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            logger.info(f"Email sent via SMTP to {to_email}")
            return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {e}")
        return False

# High-Level Template Email Functions (Can be passed directly to BackgroundTasks.add_task)

def send_welcome_email(user_email: str, user_name: str = ""):
    """Non-blocking welcome email using Jinja2 welcome.html template."""
    name = user_name or "Operator"
    subject = "Welcome to DataGem! 💎 Audit your business data in 60s"
    context = {
        "user_name": name,
        "workspace_url": "https://www.datagem.app/chat"
    }
    html = render_template("welcome.html", context)
    return send_transactional_email(user_email, subject, html)

def send_password_reset_email(user_email: str, otp_code: str):
    """Sends OTP verification code for password reset."""
    subject = "Your DataGem Verification Code"
    context = {
        "otp_code": otp_code
    }
    html = render_template("password_reset.html", context)
    return send_transactional_email(user_email, subject, html)

def send_trial_limit_warning(user_email: str, queries_left: int = 2, queries_used: int = 8):
    """Alerts user when approaching free tier daily limit."""
    subject = f"⚠️ You have {queries_left} queries left on your DataGem Free Plan"
    context = {
        "queries_left": queries_left,
        "queries_used": queries_used,
        "upgrade_url": "https://www.datagem.app/pricing"
    }
    html = render_template("trial_warning.html", context)
    return send_transactional_email(user_email, subject, html)

def send_billing_receipt(user_email: str, plan_name: str, amount_paid: float, invoice_id: str):
    """Sends an official subscription billing confirmation receipt."""
    subject = f"Receipt for your DataGem {plan_name} Subscription [#{invoice_id}]"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 30px auto; background: #090D14; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; color: #F1F5F9;">
      <h2 style="color: #34D399; margin: 0 0 8px 0;">Payment Confirmed</h2>
      <p style="color: #94A3B8; font-size: 13px;">Thank you for subscribing to DataGem {plan_name}.</p>
      <div style="background: #05070A; border: 1px solid #1E293B; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <table style="width: 100%; font-size: 13px; color: #CBD5E1;">
          <tr><td>Invoice ID:</td><td style="text-align: right; font-family: monospace;">{invoice_id}</td></tr>
          <tr><td>Plan Tier:</td><td style="text-align: right; color: #38BDF8; font-weight: 600;">{plan_name}</td></tr>
          <tr><td>Amount Paid:</td><td style="text-align: right; color: #34D399; font-weight: 700;">${amount_paid:.2f}</td></tr>
        </table>
      </div>
      <p style="color: #64748B; font-size: 11px; text-align: center;">© 2026 DataGem. Keep this receipt for your records.</p>
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_anomaly_alert(user_email: str, alert_title: str, details: dict, recommended_action: str = ""):
    """Dispatches real-time Monday 8AM / anomaly watchdog notification."""
    subject = f"🚨 DataGem Alert: {alert_title}"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 30px auto; background: #090D14; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; color: #F1F5F9;">
      <h2 style="color: #F87171; margin: 0 0 12px 0;">Automated Watchdog Triggered</h2>
      <p style="color: #CBD5E1; font-size: 14px; font-weight: 600;">{alert_title}</p>
      <div style="background: #05070A; border: 1px solid #1E293B; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <pre style="color: #94A3B8; font-size: 12px; margin: 0; white-space: pre-wrap;">{details}</pre>
      </div>
      {f'<p style="color: #38BDF8; font-size: 12px;"><strong>Action Required:</strong> {recommended_action}</p>' if recommended_action else ''}
    </div>
    """
    return send_transactional_email(user_email, subject, html)

def send_weekly_executive_digest(user_email: str, digest_metrics: dict):
    """Sends Monday 8:00 AM CEO briefing."""
    subject = "📊 Your Monday 8:00 AM Executive Briefing — DataGem"
    html = f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 550px; margin: 30px auto; background: #090D14; border: 1px solid #1E293B; border-radius: 16px; padding: 32px; color: #F1F5F9;">
      <h2 style="color: #38BDF8; margin: 0 0 12px 0;">Weekly Business Health Digest</h2>
      <p style="color: #94A3B8; font-size: 13px;">Autonomous audit from your connected stores & datasets.</p>
      <div style="background: #05070A; border: 1px solid #1E293B; border-radius: 12px; padding: 18px; margin: 20px 0;">
        <pre style="color: #34D399; font-size: 12px; margin: 0; white-space: pre-wrap;">{digest_metrics}</pre>
      </div>
    </div>
    """
    return send_transactional_email(user_email, subject, html)
