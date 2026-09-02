from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LegalProvisionBase(BaseModel):
    Law_Name: str = Field(..., min_length=2, max_length=100, description="Statutory law name (e.g. BNS, IPC, Constitution of India)")
    Section: Optional[str] = Field(None, max_length=50, description="Section identifier (e.g. Section 103, Section 303)")
    Article: Optional[str] = Field(None, max_length=50, description="Article identifier (e.g. Article 21, Article 14)")
    Description: str = Field(..., min_length=5, description="Brief description of the legal provision and its elements")

class LegalProvisionCreate(LegalProvisionBase):
    pass

class LegalProvisionResponse(LegalProvisionBase):
    Provision_ID: int
    Created_At: Optional[datetime] = None

    class Config:
        from_attributes = True
