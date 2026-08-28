from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Judgment(Base):
    __tablename__ = "judgments"

    Judgment_ID = Column("judgment_id", Integer, primary_key=True, index=True, autoincrement=True)
    Case_ID = Column("case_id", Integer, ForeignKey("cases.case_id", ondelete="CASCADE", onupdate="CASCADE"), unique=True, nullable=False, index=True)
    Case_Facts = Column("case_facts", Text, nullable=False)
    Legal_Provisions = Column("legal_provisions", Text, nullable=False)
    Court_Reasoning = Column("court_reasoning", Text, nullable=False)
    Final_Decision = Column("final_decision", Text, nullable=False)
    Created_At = Column("created_at", DateTime(timezone=True), server_default=func.now())

    # Relationship to Case
    case = relationship("Case", back_populates="judgment")

    def __repr__(self):
        return f"<Judgment(Judgment_ID={self.Judgment_ID}, Case_ID={self.Case_ID})>"
