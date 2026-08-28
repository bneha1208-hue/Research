from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    User_ID = Column("user_id", Integer, primary_key=True, index=True, autoincrement=True)
    Name = Column("name", String(100), nullable=False)
    Email = Column("email", String(150), unique=True, index=True, nullable=False)
    Password = Column("password", String(255), nullable=False)
    Role = Column("role", String(50), nullable=False)
    Created_At = Column("created_at", DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<User(User_ID={self.User_ID}, Name='{self.Name}', Email='{self.Email}', Role='{self.Role}')>"
