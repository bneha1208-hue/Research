from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Court(Base):
    __tablename__ = "courts"

    Court_ID = Column("court_id", Integer, primary_key=True, index=True, autoincrement=True)
    Court_Name = Column("court_name", String(150), nullable=False)
    Location = Column("location", String(100), nullable=False, index=True)
    Court_Level = Column("court_level", String(50), nullable=False, index=True)
    Created_At = Column("created_at", DateTime(timezone=True), server_default=func.now())

    # Relationship to Cases
    cases = relationship("Case", back_populates="court")

    def __repr__(self):
        return f"<Court(Court_ID={self.Court_ID}, Court_Name='{self.Court_Name}', Level='{self.Court_Level}', Location='{self.Location}')>"
