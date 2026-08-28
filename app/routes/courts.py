from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.court import Court
from app.schemas.court import CourtCreate, CourtResponse

router = APIRouter(prefix="/courts", tags=["Courts"])

@router.post("", response_model=CourtResponse, status_code=status.HTTP_201_CREATED)
def create_court(court_in: CourtCreate, db: Session = Depends(get_db)):
    """
    Add a new court to the system.
    """
    new_court = Court(
        Court_Name=court_in.Court_Name.strip(),
        Location=court_in.Location.strip(),
        Court_Level=court_in.Court_Level.strip()
    )
    db.add(new_court)
    db.commit()
    db.refresh(new_court)
    return new_court

@router.get("", response_model=List[CourtResponse])
def list_courts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all registered courts.
    """
    courts = db.query(Court).offset(skip).limit(limit).all()
    return courts

@router.get("/{court_id}", response_model=CourtResponse)
def get_court(court_id: int, db: Session = Depends(get_db)):
    """
    Retrieve court details by Court_ID.
    """
    court = db.query(Court).filter(Court.Court_ID == court_id).first()
    if not court:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Court with ID {court_id} not found."
        )
    return court
