from sqlalchemy import Column, Integer, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class SimilarCase(Base):
    __tablename__ = "similar_cases"

    Similarity_ID = Column("similarity_id", Integer, primary_key=True, index=True, autoincrement=True)
    Current_Case_ID = Column("current_case_id", Integer, ForeignKey("cases.case_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    Previous_Case_ID = Column("previous_case_id", Integer, ForeignKey("cases.case_id", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, index=True)
    Similarity_Score = Column("similarity_score", Float, nullable=False, index=True)
    Matching_Factors = Column("matching_factors", Text, nullable=False)
    Calculated_At = Column("calculated_at", DateTime(timezone=True), server_default=func.now())

    # Relationships
    current_case = relationship("Case", foreign_keys=[Current_Case_ID], back_populates="similar_as_current")
    previous_case = relationship("Case", foreign_keys=[Previous_Case_ID], back_populates="similar_as_previous")

    def __repr__(self):
        return f"<SimilarCase(Similarity_ID={self.Similarity_ID}, Current={self.Current_Case_ID}, Previous={self.Previous_Case_ID}, Score={self.Similarity_Score})>"
