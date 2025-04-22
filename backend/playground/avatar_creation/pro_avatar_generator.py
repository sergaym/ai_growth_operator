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
    
    def _save_image_from_url(self, image_url, filename):
        """Save an image from a URL to the output directory."""
        import requests
        
        try:
            response = requests.get(image_url)
            if response.status_code == 200:
                file_path = os.path.join(self.output_dir, filename)
                with open(file_path, 'wb') as f:
                    f.write(response.content)
                return file_path
            else:
                print(f"Failed to download image: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error saving image: {e}")
            return None
    
    def _analyze_audience(self, audience_description):
        """
        Analyze the target audience to create a detailed audience profile.
        
        Args:
            audience_description (str): Description of the target audience
            
        Returns:
            Dict: Detailed audience profile
        """
        system_prompt = """
        You are an expert audience analyst and marketing psychologist. Your task is to analyze a target audience 
        description and extract key demographic, psychographic, and behavioral characteristics that would be 
        relevant for creating an avatar that would appeal to this audience.
        
        Generate a detailed audience profile in JSON format with the following sections:
        1. Demographics (age, gender, income level, education, occupation, location)
        2. Psychographics (values, interests, lifestyle, personality traits)
        3. Visual preferences (visual style, colors, aesthetics that would appeal to them)
        4. Media consumption (platforms, content types they prefer)
        5. Key pain points and aspirations
        
        Use the provided description to make educated inferences where explicit information is not provided.
        """
        
        user_prompt = f"""
        Based on this target audience description, create a detailed audience profile:
        
        {audience_description}
        
        Please provide the analysis in structured JSON format.
        """
        
        # Get the audience analysis
        analysis_text = self._call_openai(system_prompt, user_prompt, temperature=0.5)
        
        # Try to parse the JSON response
        try:
            # Clean up any markdown formatting
            analysis_text = analysis_text.replace("```json", "").replace("```", "").strip()
            audience_profile = json.loads(analysis_text)
            return audience_profile
        except json.JSONDecodeError:
            # If parsing fails, extract structured data manually
            return {
                "raw_analysis": analysis_text,
                "error": "Failed to parse structured data"
            }
    
    def _analyze_brand(self, brand_description):
        """
        Analyze the brand to understand its identity, values, and visual style.
        
        Args:
            brand_description (str): Description of the brand
            
        Returns:
            Dict: Brand profile
        """
        system_prompt = """
        You are an expert brand strategist and designer. Your task is to analyze a brand description 
        and extract key characteristics that would be relevant for creating an avatar that represents this brand.
        
        Generate a detailed brand profile in JSON format with the following sections:
        1. Brand identity (name, mission, values, personality)
        2. Visual identity (color palette, typography style, imagery style)
        3. Tone and voice (how the brand communicates)
        4. Key differentiators (what makes this brand unique)
        
        Use the provided description to make educated inferences where explicit information is not provided.
        """
        
        user_prompt = f"""
        Based on this brand description, create a detailed brand profile:
        
        {brand_description}
        
        Please provide the analysis in structured JSON format.
        """
        
        # Get the brand analysis
        analysis_text = self._call_openai(system_prompt, user_prompt, temperature=0.5)
        
        # Try to parse the JSON response
        try:
            # Clean up any markdown formatting
            analysis_text = analysis_text.replace("```json", "").replace("```", "").strip()
            brand_profile = json.loads(analysis_text)
            return brand_profile
        except json.JSONDecodeError:
            # If parsing fails, extract structured data manually
            return {
                "raw_analysis": analysis_text,
                "error": "Failed to parse structured data"
            }
    
