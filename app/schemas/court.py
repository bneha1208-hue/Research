from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CourtBase(BaseModel):
    Court_Name: str = Field(..., min_length=2, max_length=150, description="Name of the court")
    Location: str = Field(..., min_length=2, max_length=100, description="Geographic location / city / state")
    Court_Level: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Hierarchy level: Supreme Court, High Court, District Court, Tribunal"
    )

class CourtCreate(CourtBase):
    pass

class CourtResponse(CourtBase):
    Court_ID: int
    Created_At: Optional[datetime] = None

    class Config:
        from_attributes = True
