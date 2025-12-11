from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class User(BaseModel):
    user_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    joined_at: Optional[datetime] = None

class UserContact(BaseModel):
    user_id: Optional[int] = None # Optional for web leads
    session_id: Optional[str] = None
    name: str # Required
    role: str # Required
    phone: str # Required (phone_or_messenger map to this)
    consent: bool = False # Required
    
    # Optional fields
    email: Optional[str] = None
    company: Optional[str] = None
    team_size: Optional[str] = None
    comment: Optional[str] = None # Was notes
    preferred_channel: Optional[str] = None
    
    # System fields
    product: str = "teremok"
    source: str = "landing"
    telegram_username: Optional[str] = None
    status: str = "new"
    
    # UTM
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    utm_content: Optional[str] = None
    utm_term: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class Admin(BaseModel):
    user_id: int
    username: Optional[str] = None
    role: str = "admin"
    added_at: Optional[datetime] = None

class WebAdmin(BaseModel):
    id: Optional[int] = None
    username: str
    salt: Optional[str] = None # Internal use
    password_hash: Optional[str] = None # Internal use
    created_at: Optional[datetime] = None
