from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.similar_case import SimilarCase
from app.schemas.similar_case import SimilarCaseRecordResponse

router = APIRouter(prefix="/similar-cases", tags=["Similar Cases History"])

@router.get("", response_model=List[SimilarCaseRecordResponse])
def list_similar_case_records(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieve stored historical similar case computation records.
    """
    records = db.query(SimilarCase).order_by(SimilarCase.Similarity_ID.desc()).offset(skip).limit(limit).all()
    return records

@router.get("/{similarity_id}", response_model=SimilarCaseRecordResponse)
def get_similar_case_record(similarity_id: int, db: Session = Depends(get_db)):
    """
    Retrieve specific similarity record by Similarity_ID.
    """
    record = db.query(SimilarCase).filter(SimilarCase.Similarity_ID == similarity_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Similar Case record #{similarity_id} not found."
        )
    return record
