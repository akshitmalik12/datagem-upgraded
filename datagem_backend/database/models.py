from sqlalchemy import Date
from sqlalchemy import Column
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base  # Import the "Base" blueprint from database.py

class User(Base):
    """
    This is the database table for a User.
    It tells the database to create columns for:
    - id: A unique number for each user (Primary Key)
    - email: The user's email (must be unique)
    - full_name: The user's full name (CAN be empty) <-- THIS IS THE FIX
    - hashed_password: The user's scrambled password
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, index=True, nullable=True) # <-- THIS LINE WAS ADDED
    hashed_password = Column(String, nullable=False)
    tier = Column(String, default="free", nullable=False) # 'free', 'pro', 'enterprise'
    message_count = Column(Integer, default=0, nullable=False)
    last_message_date = Column(Date, nullable=True)
    is_active = Column(Integer, default=1)

    # This creates a "link" to the ChatHistory
    # It tells SQL: "If you get a User, you can also get all
    # their chat messages. If you delete a user, delete all
    # their messages too."
    chat_history = relationship("ChatHistory", back_populates="owner", cascade="all, delete-orphan")

class ChatHistory(Base):
    """
    This is the database table for a single chat message.
    It tells the database to create columns for:
    - id: A unique number for each message
    - user_id: The ID of the user who this message belongs to (Foreign Key)
    - role: Who sent the message ("user" or "model")
    - content: The actual text of the message
    - timestamp: The time the message was created (set automatically)
    """
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(String, index=True, nullable=False, default="default")
    role = Column(String, nullable=False)  # "user" or "model"
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # This creates the other side of the "link" back to the User
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
    plotly_json = Column(String)  # We'll store the raw JSON string
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User")
