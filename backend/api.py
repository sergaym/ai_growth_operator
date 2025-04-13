"""
API server for AI Growth Operator backend services.
"""

import os
import json
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils.openai_utils import generate_marketing_idea, generate_video_prompt
from utils.prompt_utils import get_available_styles

# Load environment variables if needed
from dotenv import load_dotenv
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

# Define data models
class MarketingIdeaRequest(BaseModel):
    initial_idea: str
    target_audience: str
    industry: Optional[str] = None
    tone: Optional[str] = None
    additional_context: Optional[str] = None

class VideoPromptRequest(BaseModel):
    marketing_idea: Dict[str, Any]
    visual_style: Optional[str] = None
    duration: Optional[str] = "30 seconds"
    references: Optional[List[str]] = None

class StylesResponse(BaseModel):
    styles: List[str]

# Routes
@app.get("/")
async def root():
    """
    Root endpoint providing API information
    """
    return {
        "message": "AI Growth Operator API",
        "version": "1.0.0",
        "status": "running"
    }

@app.post("/api/marketing/idea")
async def create_marketing_idea(request: MarketingIdeaRequest):
    """
    Generate a marketing campaign idea based on initial input
    """
    try:
        result = generate_marketing_idea(
            initial_idea=request.initial_idea,
            target_audience=request.target_audience,
            industry=request.industry,
            tone=request.tone,
            additional_context=request.additional_context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating marketing idea: {str(e)}")

@app.post("/api/video/prompt")
async def create_video_prompt(request: VideoPromptRequest):
    """
    Generate a video prompt based on marketing idea
    """
    try:
        result = generate_video_prompt(
            marketing_idea=request.marketing_idea,
            visual_style=request.visual_style,
            duration=request.duration,
            references=request.references
        )
        return {"prompt": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating video prompt: {str(e)}")

@app.get("/api/styles", response_model=StylesResponse)
async def get_styles():
    """
    Get available video styles
    """
    styles = get_available_styles()
    return {"styles": styles}

# Run the application
if __name__ == "__main__":
    import uvicorn
    # Run the server on 0.0.0.0 to make it accessible from other machines
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True) 