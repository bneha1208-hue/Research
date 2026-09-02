from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class JudgmentBase(BaseModel):
    Case_ID: int = Field(..., description="Foreign key of the case this judgment belongs to")
    Case_Facts: str = Field(..., min_length=10, description="Summary of facts proven before the court")
    Legal_Provisions: str = Field(..., min_length=5, description="Legal provisions, statutes, and sections applied")
    Court_Reasoning: str = Field(..., min_length=10, description="Judicial analysis and precedent application")
    Final_Decision: str = Field(..., min_length=5, description="Final verdict / order / sentencing / relief granted")

class JudgmentCreate(JudgmentBase):
    pass

class JudgmentResponse(JudgmentBase):
    Judgment_ID: int
    Created_At: Optional[datetime] = None

    class Config:
        from_attributes = True

class JudgmentWithCaseSummary(JudgmentResponse):
    case_title: Optional[str] = None
    offence: Optional[str] = None
    location: Optional[str] = None

    class Config:
        from_attributes = True
