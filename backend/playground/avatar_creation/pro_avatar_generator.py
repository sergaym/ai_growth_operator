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
        
        # Create output directory if it doesn't exist
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _add_to_history(self, role, content):
        """Add a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})
    
    def _call_openai(self, system_prompt, user_prompt, temperature=0.7):
        """Make a call to the OpenAI API for text generation."""
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history)
        messages.append({"role": "user", "content": user_prompt})
        
        response = openai.chat.completions.create(
            model=self.text_model,
            messages=messages,
            temperature=temperature
        )
        
        content = response.choices[0].message.content.strip()
        self._add_to_history("assistant", content)
        
        return content
    
    def _generate_image(self, prompt, style="vivid", size="1024x1024"):
        """Generate an image using OpenAI's DALL-E model."""
        try:
            response = openai.images.generate(
                model=self.image_model,
                prompt=prompt,
                size=size,
                quality="standard",
                style=style,
                n=1
            )
            
            # Return the URL of the generated image
            return response.data[0].url
        except Exception as e:
            print(f"Error generating image: {e}")
            return None
    
