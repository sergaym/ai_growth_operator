"""
AI Growth Operator - Main Application File
This is the main entry point for the API service.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import configuration
from app.core.config import settings

# Import API router
from app.api import api_router

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
)

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Run the application
if __name__ == "__main__":
    import uvicorn
    # Run the server on 0.0.0.0 to make it accessible from other machines
    uvicorn.run("app.main:app", host="0.0.0.0", port=80, reload=True) 