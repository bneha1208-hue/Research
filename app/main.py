import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_tables, engine
from app.routes import (
    users_router,
    courts_router,
    legal_provisions_router,
    cases_router,
    judgments_router,
    similar_cases_router
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("legalprecedent.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown lifespan event.
    Attempts to verify/create tables on startup.
    """
    logger.info("Starting LegalPrecedent Backend...")
    try:
        create_tables()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.warning(
            f"Could not automatically connect to MySQL database at startup: {e}\n"
            f"Please verify MySQL is running and .env credentials are correct. "
            f"You can also run seed_data.py after starting MySQL."
        )
    yield
    logger.info("Shutting down LegalPrecedent Backend...")

app = FastAPI(
    title="LegalPrecedent API",
    description=(
        "**LegalPrecedent** is a legal case research assistance platform backend for law students, "
        "lawyers, and researchers.\n\n"
        "### Key Capabilities:\n"
        "- **Case Management**: Register, update, and search legal cases with simple language descriptions.\n"
        "- **Similarity Engine**: Multi-factor ranking comparing case facts (TF-IDF & Cosine Similarity), "
        "offences, court levels, geographical jurisdictions, and statutory provisions.\n"
        "- **Judgment Retrieval**: Immediate access to precedent case facts, legal provisions, judicial reasoning, "
        "and final court decisions.\n\n"
        "**Disclaimer**: *This system is intended strictly for legal research assistance and demonstration purposes. "
        "It uses sample/demo data and does not replace professional legal judgment.*"
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(users_router)
app.include_router(courts_router)
app.include_router(legal_provisions_router)
app.include_router(cases_router)
app.include_router(judgments_router)
app.include_router(similar_cases_router)

@app.get("/", tags=["General"])
def root():
    """
    Root entry point for the LegalPrecedent API.
    """
    return {
        "project": "LegalPrecedent",
        "description": "Legal Case Research Assistance Platform Backend",
        "status": "online",
        "version": "1.0.0",
        "documentation": {
            "swagger_ui": "/docs",
            "redoc": "/redoc",
            "openapi_spec": "/openapi.json"
        },
        "disclaimer": "Intended for legal research assistance with demo data; does not replace professional legal judgment."
    }

@app.get("/health", tags=["General"])
def health_check():
    """
    System and database health check endpoint.
    """
    db_status = "connected"
    db_error = None
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
    except Exception as e:
        db_status = "disconnected"
        db_error = str(e)

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "database_type": "mysql" if "mysql" in settings.database_url else "sqlite",
        "error": db_error
    }

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global unexpected error handler to prevent unformatted 500 errors.
    """
    logger.error(f"Unhandled exception on {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred.",
            "error_type": type(exc).__name__,
            "message": str(exc)
        }
    )
