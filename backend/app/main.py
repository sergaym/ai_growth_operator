"""
AI Growth Operator - Main Application File
This is the main entry point for the API service.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import routers
from app.endpoints.marketing import router as marketing_router
from app.endpoints.video import router as video_router
from app.endpoints.styles import router as styles_router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="AI Growth Operator API",
    description="Backend API for AI-powered marketing campaign generation",
    version="1.0.0"
)

# Add CORS middleware to allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(marketing_router, prefix="/api/marketing", tags=["Marketing"])
app.include_router(video_router, prefix="/api/video", tags=["Video"])
app.include_router(styles_router, prefix="/api/styles", tags=["Styles"])

# Root endpoint
@app.get("/", tags=["Status"])
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "message": "AI Growth Operator API",
        "version": "1.0.0",
        "status": "running"
    }

# Run the application
if __name__ == "__main__":
    import uvicorn
    # Run the server on 0.0.0.0 to make it accessible from other machines
    uvicorn.run("app.main:app", host="0.0.0.0", port=80, reload=True) 