from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Case(Base):
    __tablename__ = "cases"

    Case_ID = Column("case_id", Integer, primary_key=True, index=True, autoincrement=True)
    Case_Title = Column("case_title", String(200), nullable=True)
    Case_Description = Column("case_description", Text, nullable=False)
    Offence = Column("offence", String(150), nullable=False, index=True)
    Location = Column("location", String(100), nullable=False, index=True)
    Court_ID = Column("court_id", Integer, ForeignKey("courts.court_id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    Legal_Provision_ID = Column("legal_provision_id", Integer, ForeignKey("legal_provisions.provision_id", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    Created_At = Column("created_at", DateTime(timezone=True), server_default=func.now())

    # Relationships
    court = relationship("Court", back_populates="cases")
    legal_provision = relationship("LegalProvision", back_populates="cases")
    judgment = relationship("Judgment", back_populates="case", uselist=False, cascade="all, delete-orphan")
    
    # Similar case relationships
    similar_as_current = relationship("SimilarCase", foreign_keys="SimilarCase.Current_Case_ID", back_populates="current_case", cascade="all, delete-orphan")
    similar_as_previous = relationship("SimilarCase", foreign_keys="SimilarCase.Previous_Case_ID", back_populates="previous_case", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Case(Case_ID={self.Case_ID}, Offence='{self.Offence}', Location='{self.Location}', Court_ID={self.Court_ID})>"
