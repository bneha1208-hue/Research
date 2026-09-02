from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.schemas.court import CourtResponse
from app.schemas.legal_provision import LegalProvisionResponse

class CaseBase(BaseModel):
    Case_Title: Optional[str] = Field(None, max_length=200, description="Optional descriptive title for the case")
    Case_Description: str = Field(..., min_length=10, description="Detailed case facts and scenario in simple language")
    Offence: str = Field(..., min_length=2, max_length=150, description="Primary offence or legal dispute (e.g. Theft, Murder, Cheating)")
    Location: str = Field(..., min_length=2, max_length=100, description="Jurisdictional location / city / state")
    Court_ID: int = Field(..., description="ID of the court handling the case")
    Legal_Provision_ID: int = Field(..., description="ID of the associated legal provision")

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    Case_Title: Optional[str] = Field(None, max_length=200)
    Case_Description: Optional[str] = Field(None, min_length=10)
    Offence: Optional[str] = Field(None, min_length=2, max_length=150)
    Location: Optional[str] = Field(None, min_length=2, max_length=100)
    Court_ID: Optional[int] = None
    Legal_Provision_ID: Optional[int] = None

class CaseResponse(CaseBase):
    Case_ID: int
    Created_At: Optional[datetime] = None

    class Config:
        from_attributes = True

class CaseDetailResponse(CaseResponse):
    court: Optional[CourtResponse] = None
    legal_provision: Optional[LegalProvisionResponse] = None

    class Config:
        from_attributes = True
