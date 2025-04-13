"""
OpenAI service integration for the AI Growth Operator.
This module provides all interactions with the OpenAI API.
"""

import os
from typing import Dict, List, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv

# Import settings
from app.core.config import settings

# Load environment variables
load_dotenv()

# Initialize the OpenAI client
client = OpenAI(
   api_key=settings.OPENAI_API_KEY,
   base_url=os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1")
)

def generate_marketing_idea(
    initial_idea: str,
    target_audience: str,
    industry: str = None,
    tone: str = None,
    additional_context: str = None
) -> Dict[str, Any]:
    """
    Generate a marketing campaign idea based on initial input.
    
    Args:
        initial_idea: The core concept or product to market
        target_audience: Description of the target audience
        industry: The industry or sector (optional)
        tone: Desired tone for the campaign (optional)
        additional_context: Any other relevant information (optional)
        
    Returns:
        Dictionary containing the generated marketing campaign ideas
    """
    # Build the system prompt
    system_prompt = """
    You are an expert marketing campaign strategist. Your task is to develop
    compelling marketing campaign ideas based on initial concepts.
    
    Follow these steps:
    1. Analyze the initial idea and target audience
    2. Consider the industry context and appropriate tone
    3. Create a refined marketing angle that will resonate with the audience
    4. Provide a clear value proposition
    5. Suggest a campaign headline and tagline
    6. Outline key messaging points
    """
    
    # Build the user message
    user_message = f"""
    Initial Idea: {initial_idea}
    
    Target Audience: {target_audience}
    """
    
    if industry:
        user_message += f"\nIndustry: {industry}"
    
    if tone:
        user_message += f"\nDesired Tone: {tone}"
    
    if additional_context:
        user_message += f"\nAdditional Context: {additional_context}"
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model=settings.DEFAULT_GPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    
    # Extract and structure the response
    content = response.choices[0].message.content
    
    # Parse the response into structured sections
    sections = parse_response(content)
    
    return sections

def generate_video_prompt(
    marketing_idea: Dict[str, Any],
    visual_style: str = None,
    duration: str = "30 seconds",
    references: List[str] = None
) -> str:
    """
    Generate a video generation prompt based on marketing idea.
    
    Args:
        marketing_idea: The structured marketing idea from generate_marketing_idea
        visual_style: Desired visual style for the video (optional)
        duration: Target video duration (optional)
        references: List of reference links or descriptions (optional)
        
    Returns:
        A formatted video generation prompt
    """
    # Build system prompt for video generation
    system_prompt = """
    You are an expert video production scriptwriter. Your task is to create
    a detailed video prompt that will guide AI video generation.
    
    The prompt should:
    1. Describe clear visuals that tell a story
    2. Include camera angles and movements
    3. Describe any text overlays or graphics needed
    4. Maintain a cohesive narrative that reinforces the marketing message
    5. Be optimized for the specified duration
    6. Follow the requested visual style
    
    Format the prompt as a scene-by-scene description, with each scene numbered.
    """
    
    # Build the user message
    user_message = f"""
    Marketing Headline: {marketing_idea.get('headline', 'No headline provided')}
    
    Key Message: {marketing_idea.get('value_proposition', 'No value proposition provided')}
    
    Target Audience: {marketing_idea.get('target_audience', 'No audience information')}
    
    Duration: {duration}
    """
    
    if visual_style:
        user_message += f"\nVisual Style: {visual_style}"
    
    if references:
        references_text = "\n".join([f"- {ref}" for ref in references])
        user_message += f"\n\nReferences:\n{references_text}"
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model=settings.DEFAULT_GPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=1500
    )
    
    # Return the generated prompt
    return response.choices[0].message.content

def parse_response(content: str) -> Dict[str, Any]:
    """
    Parse the response from OpenAI into structured sections.
    
    Args:
        content: The text response from OpenAI
        
    Returns:
        Dictionary with structured content
    """
    # Initialize the result dictionary
    result = {
        "headline": "",
        "tagline": "",
        "value_proposition": "",
        "key_messages": [],
        "full_response": content
    }
    
    # Look for a headline (typically in the first lines or after "Headline:" marker)
    lines = content.split('\n')
    
    for i, line in enumerate(lines):
        line = line.strip()
        
        # Try to extract headline
        if "headline:" in line.lower():
            result["headline"] = line.split(":", 1)[1].strip()
        
        # Try to extract tagline
        elif "tagline:" in line.lower():
            result["tagline"] = line.split(":", 1)[1].strip()
        
        # Try to extract value proposition
        elif "value proposition:" in line.lower():
            result["value_proposition"] = line.split(":", 1)[1].strip()
        
        # Try to extract key messages
        elif "key message" in line.lower() or "messaging point" in line.lower():
            # Check if this is a numbered or bulleted point
            if ":" in line:
                msg = line.split(":", 1)[1].strip()
                result["key_messages"].append(msg)
            else:
                # If the next line might contain the actual message
                if i+1 < len(lines) and lines[i+1].strip() and ":" not in lines[i+1].lower():
                    result["key_messages"].append(lines[i+1].strip())
    
    # If we couldn't find these sections with explicit markers, make a best guess
    if not result["headline"] and len(lines) > 0:
        for line in lines:
            if line.strip() and len(line.strip()) < 100:  # Reasonable headline length
                result["headline"] = line.strip()
                break
    
    # Clean up the key messages
    result["key_messages"] = [msg for msg in result["key_messages"] if msg]
    
    return result 