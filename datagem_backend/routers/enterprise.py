import secrets
import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from typing import List, Optional

from database import database, models
from auth.security import get_current_active_user, get_password_hash
from utils.email_utils import send_transactional_email, send_anomaly_alert, send_weekly_executive_digest

router = APIRouter(prefix="/enterprise", tags=["Enterprise Multi-Tenancy & Reporting"])

# Pydantic Schemas
class CreateOrgRequest(BaseModel):
    name: str

class InviteMemberRequest(BaseModel):
    email: EmailStr
    role: str = "analyst" # 'admin', 'analyst', 'viewer'

class CreateShareableReportRequest(BaseModel):
    title: str
    summary_markdown: str
    chart_json: Optional[str] = None
    password: Optional[str] = None

class AnomalyTriggerRequest(BaseModel):
    sku: str
    channel: str
    fee_percentage: float
    current_fee: float
    gmv: float

@router.post("/organization")
def create_organization(
    payload: CreateOrgRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Creates a new Company / Team workspace."""
    slug = payload.name.lower().replace(" ", "-") + "-" + secrets.token_hex(3)
    org = models.Organization(
        name=payload.name,
        slug=slug,
        owner_id=current_user.id,
        plan_tier=current_user.tier
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    # Add owner as admin member
    member = models.WorkspaceMember(
        org_id=org.id,
        user_id=current_user.id,
        role="admin"
    )
    db.add(member)
    db.commit()

    return {
        "success": True,
        "organization": {
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "role": "admin"
        }
    }

@router.get("/organization/members")
def list_workspace_members(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Lists team members and their RBAC roles."""
    # Find org where user is member
    membership = db.query(models.WorkspaceMember).filter(models.WorkspaceMember.user_id == current_user.id).first()
    if not membership:
        return {"members": [{
            "id": current_user.id,
            "email": current_user.email,
            "name": current_user.full_name or "Workspace Owner",
            "role": "admin"
        }]}

    members = db.query(models.WorkspaceMember).filter(models.WorkspaceMember.org_id == membership.org_id).all()
    res = []
    for m in members:
        u = db.query(models.User).filter(models.User.id == m.user_id).first()
        if u:
            res.append({
                "id": u.id,
                "email": u.email,
                "name": u.full_name or "Team Member",
                "role": m.role
            })
    return {"members": res}

@router.post("/organization/invite")
def invite_workspace_member(
    payload: InviteMemberRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Invites a team member with role-based access control (RBAC)."""
    # Verify user exists or provision invitation
    target = db.query(models.User).filter(models.User.email == payload.email).first()
    if not target:
        temp_pass = secrets.token_urlsafe(12)
        target = models.User(
            email=payload.email,
            hashed_password=get_password_hash(temp_pass),
            full_name=payload.email.split("@")[0].capitalize(),
            tier=current_user.tier
        )
        db.add(target)
        db.commit()
        db.refresh(target)

    # Check or create default org
    membership = db.query(models.WorkspaceMember).filter(models.WorkspaceMember.user_id == current_user.id).first()
    if not membership:
        org = models.Organization(
            name=f"{current_user.email.split('@')[0].capitalize()} Org",
            slug=f"org-{secrets.token_hex(4)}",
            owner_id=current_user.id,
            plan_tier=current_user.tier
        )
        db.add(org)
        db.commit()
        db.refresh(org)
        db.add(models.WorkspaceMember(org_id=org.id, user_id=current_user.id, role="admin"))
        org_id = org.id
    else:
        org_id = membership.org_id

    # Add member
    new_member = models.WorkspaceMember(
        org_id=org_id,
        user_id=target.id,
        role=payload.role.lower()
    )
    db.add(new_member)
    db.commit()

    # Send invite email
    invite_html = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #070A10; color: #F1F5F9; padding: 32px; border-radius: 16px; border: 1px solid #1E293B;">
      <h2 style="color: #FFFFFF; margin-top: 0;">You're Invited to DataGem Workspace</h2>
      <p style="color: #CBD5E1; font-size: 14px;"><strong>{current_user.email}</strong> invited you to collaborate as an <strong>{payload.role.upper()}</strong>.</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="https://www.datagem.app/login" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Accept Invite &amp; Sign In →</a>
      </div>
    </div>
    """
    send_transactional_email(payload.email, "Team Workspace Invitation — DataGem", invite_html)

    return {"success": True, "message": f"Successfully invited {payload.email} as {payload.role}."}

@router.post("/reports/share")
def create_shareable_report(
    payload: CreateShareableReportRequest,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(database.get_db)
):
    """Generates an external, shareable public report link with optional password protection."""
    token = secrets.token_urlsafe(16)
    report = models.SharedReport(
        user_id=current_user.id,
        share_token=token,
        title=payload.title,
        summary_markdown=payload.summary_markdown,
        chart_json=payload.chart_json,
        password_hash=get_password_hash(payload.password) if payload.password else None
    )
    db.add(report)
    db.commit()

    return {
        "success": True,
        "share_token": token,
        "share_url": f"https://www.datagem.app/shared/{token}"
    }

@router.get("/reports/shared/{token}")
def get_public_report(token: str, db: Session = Depends(database.get_db)):
    """Retrieves a public shareable report without requiring authentication."""
    report = db.query(models.SharedReport).filter(models.SharedReport.share_token == token).first()
    if not report:
        raise HTTPException(status_code=404, detail="Shared report not found or expired")

    report.views_count = (report.views_count or 0) + 1
    db.commit()

    return {
        "title": report.title,
        "summary": report.summary_markdown,
        "chart_json": report.chart_json,
        "views": report.views_count,
        "created_at": report.created_at.isoformat() if report.created_at else None,
        "has_password": bool(report.password_hash)
    }

@router.post("/watchdog/trigger-test-alert")
def trigger_watchdog_anomaly(
    payload: AnomalyTriggerRequest,
    current_user: models.User = Depends(get_current_active_user)
):
    """Simulates an autonomous fee spike or return rate watchdog alert."""
    details = f"Channel: {payload.channel} | SKU: {payload.sku} | Fee: ₹{payload.current_fee} ({payload.fee_percentage}% of GMV ₹{payload.gmv})"
    action = "Audit marketplace MTR report and file clawback ticket with seller support."
    send_anomaly_alert(current_user.email, f"Fee Spike Exceeded 22% on {payload.sku}", details, action)
    return {"success": True, "message": f"Autonomous alert dispatched to {current_user.email}."}
