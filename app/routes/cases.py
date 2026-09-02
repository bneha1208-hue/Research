from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.case import Case
from app.models.court import Court
from app.models.legal_provision import LegalProvision
from app.schemas.case import CaseCreate, CaseUpdate, CaseResponse, CaseDetailResponse
from app.schemas.similar_case import CaseSimilarityAnalysisResponse
from app.services.similarity import find_similar_cases

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=CaseDetailResponse, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    """
    Add a new legal case.
    Validates that Court_ID and Legal_Provision_ID exist.
    """
    # Verify Court exists
    court = db.query(Court).filter(Court.Court_ID == case_in.Court_ID).first()
    if not court:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Court with ID {case_in.Court_ID} does not exist."
        )

    # Verify Legal Provision exists
    provision = db.query(LegalProvision).filter(LegalProvision.Provision_ID == case_in.Legal_Provision_ID).first()
    if not provision:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Legal Provision with ID {case_in.Legal_Provision_ID} does not exist."
        )

    new_case = Case(
        Case_Title=case_in.Case_Title.strip() if case_in.Case_Title else None,
        Case_Description=case_in.Case_Description.strip(),
        Offence=case_in.Offence.strip(),
        Location=case_in.Location.strip(),
        Court_ID=case_in.Court_ID,
        Legal_Provision_ID=case_in.Legal_Provision_ID
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return new_case

@router.get("", response_model=List[CaseDetailResponse])
def list_cases(
    offence: Optional[str] = Query(None, description="Filter by offence"),
    location: Optional[str] = Query(None, description="Filter by location"),
    court_id: Optional[int] = Query(None, description="Filter by court ID"),
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """
    Retrieve all cases with optional filtering.
    """
    query = db.query(Case)
    if offence:
        query = query.filter(Case.Offence.ilike(f"%{offence}%"))
    if location:
        query = query.filter(Case.Location.ilike(f"%{location}%"))
    if court_id:
        query = query.filter(Case.Court_ID == court_id)

    cases = query.order_by(Case.Case_ID.desc()).offset(skip).limit(limit).all()
    return cases

@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(case_id: int, db: Session = Depends(get_db)):
    """
    Retrieve single case details by Case_ID including associated Court and Legal Provision.
    """
    case = db.query(Case).filter(Case.Case_ID == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found."
        )
    return case

@router.put("/{case_id}", response_model=CaseDetailResponse)
def update_case(case_id: int, case_update: CaseUpdate, db: Session = Depends(get_db)):
    """
    Update an existing case's details.
    """
    case = db.query(Case).filter(Case.Case_ID == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found."
        )

    if case_update.Court_ID is not None:
        court = db.query(Court).filter(Court.Court_ID == case_update.Court_ID).first()
        if not court:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Court with ID {case_update.Court_ID} does not exist."
            )
        case.Court_ID = case_update.Court_ID

    if case_update.Legal_Provision_ID is not None:
        provision = db.query(LegalProvision).filter(LegalProvision.Provision_ID == case_update.Legal_Provision_ID).first()
        if not provision:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Legal Provision with ID {case_update.Legal_Provision_ID} does not exist."
            )
        case.Legal_Provision_ID = case_update.Legal_Provision_ID

    if case_update.Case_Title is not None:
        case.Case_Title = case_update.Case_Title.strip() if case_update.Case_Title else None
    if case_update.Case_Description is not None:
        case.Case_Description = case_update.Case_Description.strip()
    if case_update.Offence is not None:
        case.Offence = case_update.Offence.strip()
    if case_update.Location is not None:
        case.Location = case_update.Location.strip()

    db.commit()
    db.refresh(case)
    return case

@router.delete("/{case_id}", status_code=status.HTTP_200_OK)
def delete_case(case_id: int, db: Session = Depends(get_db)):
    """
    Delete a case by Case_ID.
    """
    case = db.query(Case).filter(Case.Case_ID == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found."
        )

    db.delete(case)
    db.commit()
    return {"message": f"Case #{case_id} deleted successfully.", "deleted_case_id": case_id}

@router.get("/{case_id}/similar", response_model=CaseSimilarityAnalysisResponse)
def get_similar_cases(
    case_id: int,
    top_n: int = Query(5, ge=1, le=50, description="Maximum number of top similar cases to return"),
    db: Session = Depends(get_db)
):
    """
    Search historical cases, calculate multi-factor similarity score (TF-IDF cosine similarity,
    offence, location, court, legal provision), identify matching factors, rank cases,
    and attach judgment details.
    """
    case = db.query(Case).filter(Case.Case_ID == case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case with ID {case_id} not found."
        )

    return find_similar_cases(current_case=case, db=db, top_n=top_n, save_to_db=True)
