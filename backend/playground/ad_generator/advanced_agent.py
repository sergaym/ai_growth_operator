import os
import json
import openai
import re
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any, Tuple

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class AdvancedAdGeneratorAgent:
    """
    An advanced agent that functions as a professional content director to create
    high-quality commercial advertisements using multi-turn reasoning and expertise.
    """
    
    def __init__(self, model="gpt-4-turbo"):
        """Initialize the AdvancedAdGeneratorAgent."""
        self.model = model
        self.conversation_history = []
        self.creative_brief = {
            "brand": {},
            "audience": {},
            "product": {},
            "competitors": {},
            "objectives": {},
            "tone_and_style": {},
            "examples": [],
            "distribution_channels": []
        }
        self.industry = None
        self.ad_variations = []
        self.selected_variation = None
        
