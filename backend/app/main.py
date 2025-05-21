"""
AI Growth Operator - Main Application File
This is the main entry point for the API service.
"""

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging

# Import configuration
from app.core.config import settings

# Import API router
from app.api import api_router

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Explicitly define origins for CORS
origins = [
    "http://localhost:3000",
    "https://localhost:3000",
    "https://localhost:80",
    "http://127.0.0.1:3000",
    "https://ai-ugc.vercel.app",
    "https://ai-growth-operator.vercel.app",
    "https://ai-ugc-git-main.vercel.app",
    "https://ai-api-growth-op-sw9m9.ondigitalocean.app",
    "https://*.vercel.app"
]

# Add CORS middleware with more permissive configuration for troubleshooting
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods for simplicity during debugging
    allow_headers=["*"],  # Allow all headers for simplicity
    expose_headers=["*"],
    max_age=86400,  # Cache preflight requests for 24 hours
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "localhost",
        "127.0.0.1",
        "*.vercel.app",
        "*.ondigitalocean.app",
    ],
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Root endpoint
@app.get("/", tags=["Status"])
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "message": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "running"
    }

