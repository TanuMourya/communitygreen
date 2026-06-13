from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IssueCreate(BaseModel):
    title: str
    description: str
    latitude: float
    longitude: float

class IssueUpdate(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    severity: Optional[str] = None

class IssueOut(BaseModel):
    id: int
    title: str
    description: str
    photo_url: Optional[str]
    latitude: float
    longitude: float
    category: Optional[str]
    severity: str
    status: str
    upvotes: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True