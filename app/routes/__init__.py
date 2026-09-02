from app.routes.users import router as users_router
from app.routes.courts import router as courts_router
from app.routes.legal_provisions import router as legal_provisions_router
from app.routes.cases import router as cases_router
from app.routes.judgments import router as judgments_router
from app.routes.similar_cases import router as similar_cases_router

__all__ = [
    "users_router",
    "courts_router",
    "legal_provisions_router",
    "cases_router",
    "judgments_router",
    "similar_cases_router",
]
