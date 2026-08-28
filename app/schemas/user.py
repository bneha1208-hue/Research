from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    Name: str = Field(..., min_length=2, max_length=100, description="Full name of user")
    Email: EmailStr = Field(..., description="User unique email address")
    Role: str = Field(
        ...,
        description="Role in legal field (e.g. Lawyer, Legal Researcher, Law Student, Law Firm, Legal Intern)"
    )

class UserCreate(UserBase):
    Password: str = Field(..., min_length=6, description="User password (min 6 characters)")

class UserLogin(BaseModel):
    Email: EmailStr
    Password: str

class UserResponse(BaseModel):
    User_ID: int
    Name: str
    Email: str
    Role: str
    Created_At: Optional[datetime] = None

    class Config:
        from_attributes = True
