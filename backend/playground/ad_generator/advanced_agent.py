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
        
    def _add_to_history(self, role, content):
        """Add a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})
        
    def _call_openai(self, system_prompt, user_prompt, temperature=0.7):
        """Make a call to the OpenAI API."""
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history)
        messages.append({"role": "user", "content": user_prompt})
        
        response = openai.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=temperature
        )
        
        content = response.choices[0].message.content.strip()
        self._add_to_history("assistant", content)
        
        return content
    
