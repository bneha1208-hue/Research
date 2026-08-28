from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.schemas.judgment import JudgmentResponse

class MatchingFactorDetail(BaseModel):
    factor: str
    description: str
    match_type: str  # 'exact', 'high_text_similarity', 'jurisdiction', etc.

class SimilarCaseResultItem(BaseModel):
    previous_case_id: int
    case_title: Optional[str] = None
    case_description: str
    offence: str
    location: str
    court_name: str
    court_level: str
    legal_provision: str
    similarity_score: float = Field(..., description="Similarity score between 0.0 and 100.0")
    similarity_percentage: str = Field(..., description="Formatted percentage string e.g. '87.5%'")
    matching_factors: List[str] = Field(default_factory=list, description="List of matching key factors")
    judgment: Optional[JudgmentResponse] = Field(None, description="Detailed judgment if available for the precedent case")

class CaseSimilarityAnalysisResponse(BaseModel):
    current_case_id: int
    current_case_title: Optional[str] = None
    current_offence: str
    current_location: str
    current_court: str
    current_legal_provision: str
    total_precedents_evaluated: int
    total_matches_found: int
    similar_cases: List[SimilarCaseResultItem]

class SimilarCaseRecordResponse(BaseModel):
    Similarity_ID: int
    Current_Case_ID: int
    Previous_Case_ID: int
    Similarity_Score: float
    Matching_Factors: str
    Calculated_At: Optional[datetime] = None

    class Config:
        from_attributes = True
