from sqlalchemy.orm import Session
# We REMOVED the "from auth import security" to break the circle

# We use absolute imports (starting from the root)
from database import models as db_models
from auth import models as auth_models 

# =====================
# User CRUD
# =====================

def get_user_by_email(db: Session, email: str):
    """Fetch a single user by their email address."""
    return db.query(db_models.User).filter(db_models.User.email == email).first()

def create_user(db: Session, user: db_models.User):
    """
    Create a new user.
    This function is now "dumber". It just adds the user.
    The "auth" file will handle password scrambling *before* calling this.
    """
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

# =====================
# Chat History CRUD
# =====================

def get_chat_history(db: Session, user_id: int, session_id: str, limit: int = 50):
    """Get the N most recent chat messages for a specific user."""
    return (
        db.query(db_models.ChatHistory)
        .filter(db_models.ChatHistory.user_id == user_id)
        .filter(db_models.ChatHistory.session_id == session_id)
        .order_by(db_models.ChatHistory.timestamp.desc())
        .limit(limit)
        .all()
    )

def save_chat_message(db: Session, user_id: int, session_id: str, role: str, content: str):
    """
    Save a new chat message (from user or AI) to the database.
    This is now simpler and just takes the raw parts.
    """
    db_message = db_models.ChatHistory(
        user_id=user_id,
        session_id=session_id,
        role=role,
        content=content
        # timestamp is set automatically by the database
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
