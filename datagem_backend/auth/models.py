from pydantic import BaseModel, EmailStr

# =====================
# This file defines the PYDANTIC models (data shapes) for the API
# These are NOT the database models
# =====================

class Token(BaseModel):
    """
    Defines the shape of the JWT token response.
    """
    access_token: str
    token_type: str

class TokenData(BaseModel):
    """
    Defines the shape of the data hidden inside the JWT.
    """
    email: EmailStr | None = None

class UserBase(BaseModel):
    """
    The basic shape of a user, used for creating new ones.
    """
    email: EmailStr
    full_name: str | None = None

class UserCreate(UserBase):
    """
    The shape of data expected when a user signs up.
    """
    password: str

class UserInDB(UserBase):
    """
    The shape of user data we are *allowed* to send back to the client.
    Note: It does NOT include the hashed_password.
    """
    id: int
    tier: str
    message_count: int = 0

    class Config:
        # This tells Pydantic it's okay to read data from an
        # ORM (SQLAlchemy) object, not just a plain dictionary.
        from_attributes = True
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
