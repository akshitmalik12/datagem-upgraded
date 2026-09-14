import os
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session
import bcrypt

# --- THIS IS THE FIX ---
# We changed `..database` to `database` to make it an absolute import
from database import crud, database, models as db_models
# --- END FIX ---

# =====================
# SECRET KEYS (from environment)
# =====================
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY environment variable is required. Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\"")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
# =====================

# Setup for "scrambling" passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# This tells FastAPI what "login door" to check for a key
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

class TokenData(BaseModel):
    """The 'data' we will hide inside our 'keys' (tokens)."""
    email: str | None = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check if the typed-in password matches the scrambled one."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to bcrypt directly if passlib fails
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

def get_password_hash(password: str) -> str:
    """Turn a plain password into a scrambled (hashed) one."""
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback to bcrypt directly if passlib fails
        password_bytes = password.encode('utf-8')
        hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt())
        return hashed.decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    """Create a new 'key' (JWT token) for a user."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    db: Session = Depends(database.get_db), token: str = Depends(oauth2_scheme)
) -> db_models.User:
    """
    This is the "bouncer" for our API. It checks the user's "key" (token).
    It will raise an error if the key is bad:
Signature Invalid: This 'key' is fake or was tampered with.
Token Expired: This 'key' is too old.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: db_models.User = Depends(get_current_user),
) -> db_models.User:
    """
    A helper function to check if the user is not (for example)
    banned or deactivated. We don't use this, but it's good practice.
    """
    # if current_user.is_disabled:
    #     raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
