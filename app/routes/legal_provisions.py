from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.legal_provision import LegalProvision
from app.schemas.legal_provision import LegalProvisionCreate, LegalProvisionResponse

router = APIRouter(prefix="/legal-provisions", tags=["Legal Provisions"])

@router.post("", response_model=LegalProvisionResponse, status_code=status.HTTP_201_CREATED)
def create_legal_provision(provision_in: LegalProvisionCreate, db: Session = Depends(get_db)):
    """
    Add a new legal provision (e.g., BNS Section or Constitutional Article).
    """
    new_prov = LegalProvision(
        Law_Name=provision_in.Law_Name.strip(),
        Section=provision_in.Section.strip() if provision_in.Section else None,
        Article=provision_in.Article.strip() if provision_in.Article else None,
        Description=provision_in.Description.strip()
    )
    db.add(new_prov)
    db.commit()
    db.refresh(new_prov)
    return new_prov

@router.get("", response_model=List[LegalProvisionResponse])
def list_legal_provisions(
    law_name: Optional[str] = Query(None, description="Filter by Law Name"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Retrieve all legal provisions with optional filtering.
    """
    query = db.query(LegalProvision)
    if law_name:
        query = query.filter(LegalProvision.Law_Name.ilike(f"%{law_name}%"))
    return query.offset(skip).limit(limit).all()

@router.get("/{provision_id}", response_model=LegalProvisionResponse)
def get_legal_provision(provision_id: int, db: Session = Depends(get_db)):
    """
    Retrieve specific legal provision details by Provision_ID.
    """
    prov = db.query(LegalProvision).filter(LegalProvision.Provision_ID == provision_id).first()
    if not prov:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Legal provision with ID {provision_id} not found."
        )
    return prov
