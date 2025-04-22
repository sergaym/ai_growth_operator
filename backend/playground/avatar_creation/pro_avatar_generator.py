import os
import json
import base64
import openai
from dotenv import load_dotenv
from typing import Dict, List, Optional, Any, Tuple
import time

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class ProAvatarGenerator:
    """
    Professional avatar generator that creates custom avatars based on target audience analysis.
    Uses audience insights to generate avatars that will resonate with the intended demographic.
    """
    
    def __init__(self, model="gpt-4-turbo", image_model="dall-e-3"):
        """
        Initialize the ProAvatarGenerator.
        
        Args:
            model (str): OpenAI text model to use for analysis, defaults to "gpt-4-turbo"
            image_model (str): OpenAI image model to use for generation, defaults to "dall-e-3"
        """
        self.text_model = model
        self.image_model = image_model
        self.conversation_history = []
        self.audience_profile = {}
        self.brand_profile = {}
        self.avatar_style = {}
        self.avatar_variations = []
        self.selected_avatar = None
        self.output_dir = os.path.join("backend", "playground", "avatar_creation", "output")
        
