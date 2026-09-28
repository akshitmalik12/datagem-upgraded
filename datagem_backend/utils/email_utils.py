import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)

def send_welcome_email(user_email: str, user_name: str):
    smtp_email = os.getenv("SMTP_EMAIL")
    smtp_password = os.getenv("SMTP_PASSWORD")
    
    if not smtp_email or not smtp_password:
        logger.warning("SMTP credentials not found, skipping welcome email.")
        return

    msg = EmailMessage()
    msg["Subject"] = "Welcome to DataGem! 💎 Get Started with Pro"
    msg["From"] = f"DataGem Team <{smtp_email}>"
    msg["To"] = user_email
    
    display_name = user_name or "Data Enthusiast"

    # HTML Body
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #4F46E5;">Welcome to DataGem, {display_name}! 🚀</h2>
        <p>We are thrilled to have you on board. You can now start uploading your datasets and chatting with our AI to unlock insights instantly.</p>
        
        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Ready to unlock more power?</h3>
            <p>Your current <strong>Free</strong> tier is great for getting started, but you can upgrade to handle massive datasets, unlock priority AI response times, and get unlimited chats!</p>
            
            <a href="https://datagem.app/pricing" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">Upgrade to Pro</a>
            <a href="https://datagem.app/pricing" style="display: inline-block; background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Enterprise</a>
        </div>
        
        <p>If you have any questions, just hit reply to this email!</p>
        <p>Cheers,<br>The DataGem Team</p>
      </body>
    </html>
    """
    
    msg.set_content("Welcome to DataGem! Upgrade to Pro at https://datagem.app/pricing")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
            logger.info(f"Welcome email sent successfully to {user_email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email: {e}")

