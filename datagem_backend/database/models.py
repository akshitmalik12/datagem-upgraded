from sqlalchemy import Date, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class Organization(Base):
    """
    Company / Team Workspace for multi-user collaboration and RBAC.
    """
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_tier = Column(String, default="enterprise", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("WorkspaceMember", back_populates="organization", cascade="all, delete-orphan")
    shared_charts = relationship("SharedReport", back_populates="organization", cascade="all, delete-orphan")

class WorkspaceMember(Base):
    """
    Role-Based Access Control (RBAC):
    - 'admin': Full access, billing, and connector management.
    - 'analyst': Upload datasets, execute queries, and generate charts.
    - 'viewer': Read-only access to shared dashboards and alerts.
    """
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, default="analyst", nullable=False) # 'admin', 'analyst', 'viewer'
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="members")
    user = relationship("User")

class SharedReport(Base):
    """
    Shareable public links and automated reporting snapshots.
    """
    __tablename__ = "shared_reports"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("organizations.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_token = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, default="Executive E-Commerce Report")
    summary_markdown = Column(Text, nullable=False)
    chart_json = Column(Text, nullable=True)
    password_hash = Column(String, nullable=True) # Optional password protection
    is_public = Column(Boolean, default=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    organization = relationship("Organization", back_populates="shared_charts")
    creator = relationship("User")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    tier = Column(String, default="free", nullable=False)
    message_count = Column(Integer, default=0, nullable=False)
    last_message_date = Column(Date, nullable=True)
    is_active = Column(Integer, default=1)

    chat_history = relationship("ChatHistory", back_populates="owner", cascade="all, delete-orphan")

class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, index=True, nullable=False, default="default")
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="chat_history")

class PasswordReset(Base):
    __tablename__ = "password_resets"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp = Column(String, nullable=False)
    expires_at = Column(DateTime, nullable=False)

class SavedChart(Base):
    __tablename__ = "saved_charts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, default="Untitled Chart")
    plotly_json = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
