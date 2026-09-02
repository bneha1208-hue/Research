import hashlib
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserLogin

router = APIRouter(prefix="/users", tags=["Users"])

def hash_password(password: str) -> str:
    """Hash password using SHA-256 for simple portable hashing."""
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user (Lawyer, Legal Researcher, Law Student, Law Firm, Legal Intern).
    """
    # Check if email is already registered
    existing_user = db.query(User).filter(User.Email == user_in.Email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user_in.Email}' already exists."
        )

    valid_roles = ["lawyer", "legal researcher", "law student", "law firm", "legal intern", "admin"]
    if user_in.Role.lower() not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role '{user_in.Role}'. Allowed roles: Lawyer, Legal Researcher, Law Student, Law Firm, Legal Intern."
        )

    new_user = User(
        Name=user_in.Name.strip(),
        Email=user_in.Email.strip().lower(),
        Password=hash_password(user_in.Password),
        Role=user_in.Role.strip().title()
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A database integrity conflict occurred while registering the user."
        )

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve user details by User_ID.
    """
    user = db.query(User).filter(User.User_ID == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found."
        )
    return user

@router.get("", response_model=List[UserResponse])
def list_users(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    List all registered users.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/login", response_model=UserResponse)
def login_user(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Simple login verification for demo and testing.
    """
    user = db.query(User).filter(User.Email == login_data.Email.strip().lower()).first()
    if not user or not verify_password(login_data.Password, user.Password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    return user
