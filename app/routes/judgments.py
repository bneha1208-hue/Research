from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.judgment import Judgment
from app.models.case import Case
from app.schemas.judgment import JudgmentCreate, JudgmentResponse, JudgmentWithCaseSummary

router = APIRouter(tags=["Judgments"])

@router.post("/judgments", response_model=JudgmentResponse, status_code=status.HTTP_201_CREATED)
def create_judgment(judgment_in: JudgmentCreate, db: Session = Depends(get_db)):
    """
    Add a judgment for an existing case.
    """
    # Check if case exists
    case = db.query(Case).filter(Case.Case_ID == judgment_in.Case_ID).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {judgment_in.Case_ID} not found."
        )

    # Check if judgment already exists for this case
    existing = db.query(Judgment).filter(Judgment.Case_ID == judgment_in.Case_ID).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A judgment already exists for Case ID {judgment_in.Case_ID} (Judgment ID: {existing.Judgment_ID})."
        )

    new_judgment = Judgment(
        Case_ID=judgment_in.Case_ID,
        Case_Facts=judgment_in.Case_Facts.strip(),
        Legal_Provisions=judgment_in.Legal_Provisions.strip(),
        Court_Reasoning=judgment_in.Court_Reasoning.strip(),
        Final_Decision=judgment_in.Final_Decision.strip()
    )

    db.add(new_judgment)
    db.commit()
    db.refresh(new_judgment)
    return new_judgment

@router.get("/judgments", response_model=List[JudgmentResponse])
def list_judgments(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Retrieve all judgments in the database.
    """
    judgments = db.query(Judgment).offset(skip).limit(limit).all()
    return judgments

@router.get("/judgments/{judgment_id}", response_model=JudgmentResponse)
def get_judgment(judgment_id: int, db: Session = Depends(get_db)):
    """
    Retrieve judgment by Judgment_ID.
    """
    judgment = db.query(Judgment).filter(Judgment.Judgment_ID == judgment_id).first()
    if not judgment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Judgment with ID {judgment_id} not found."
        )
    return judgment

@router.get("/cases/{case_id}/judgment", response_model=JudgmentResponse)
def get_judgment_by_case(case_id: int, db: Session = Depends(get_db)):
    """
    Retrieve judgment details for a specific Case_ID.
    """
    case = db.query(Case).filter(Case.Case_ID == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found."
        )

    judgment = db.query(Judgment).filter(Judgment.Case_ID == case_id).first()
    if not judgment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No judgment record found for Case ID {case_id}."
        )

    return judgment
