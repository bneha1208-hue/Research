from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class LegalProvision(Base):
    __tablename__ = "legal_provisions"

    Provision_ID = Column("provision_id", Integer, primary_key=True, index=True, autoincrement=True)
    Law_Name = Column("law_name", String(100), nullable=False, index=True)
    Section = Column("section", String(50), nullable=True, index=True)
    Article = Column("article", String(50), nullable=True)
    Description = Column("description", Text, nullable=False)
    Created_At = Column("created_at", DateTime(timezone=True), server_default=func.now())

    # Relationship to Cases
    cases = relationship("Case", back_populates="legal_provision")

    def __repr__(self):
        label = self.Section if self.Section else self.Article
        return f"<LegalProvision(Provision_ID={self.Provision_ID}, Law='{self.Law_Name}', Identifier='{label}')>"
