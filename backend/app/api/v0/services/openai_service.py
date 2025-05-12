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

def generate_idea(
    initial_idea: str,
    target_audience: str,
    industry: str = None,
    tone: str = None,
    additional_context: str = None
) -> Dict[str, Any]:
    """
    Generate a creative idea based on initial input.
    
    Args:
        initial_idea: The core concept or product to develop
        target_audience: Description of the target audience
        industry: The industry or sector (optional)
        tone: Desired tone for the content (optional)
        additional_context: Any other relevant information (optional)
        
    Returns:
        Dictionary containing the generated ideas
    """
    # Build the system prompt
    system_prompt = """
    You are an expert creative strategist. Your task is to develop
    compelling ideas based on initial concepts.
    
    Follow these steps:
    1. Analyze the initial idea and target audience
    2. Consider the industry context and appropriate tone
    3. Create a refined angle that will resonate with the audience
    4. Provide a clear value proposition
    5. Suggest a headline and tagline
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

# For backward compatibility
generate_marketing_idea = generate_idea

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

def refine_idea(prompt_idea: str, target_audience: str) -> Dict[str, str]:
    """
    Refine an initial idea based on the target audience.
    
    Args:
        prompt_idea: The initial idea to refine
        target_audience: Description of the target audience
        
    Returns:
        Dictionary containing the refined idea and rationale
    """
    # Build the system prompt
    system_prompt = """
    You are an expert marketing strategist and idea refiner. Your task is to take an initial idea
    and refine it to better target a specific audience.
    
    Follow these steps:
    1. Analyze the initial idea and understand its core concept
    2. Consider the target audience's demographics, interests, and pain points
    3. Refine the initial idea to make it more relevant and appealing to the target audience
    4. Provide a clear rationale for your refinements
    
    Your response should be concise yet comprehensive.
    """
    
    # Build the user message
    user_message = f"""
    Initial Idea: {prompt_idea}
    
    Target Audience: {target_audience}
    """
    
    # Call OpenAI API
    response = client.chat.completions.create(
        model=settings.DEFAULT_GPT_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        temperature=0.7,
        max_tokens=800
    )
    
    # Extract the content
    content = response.choices[0].message.content
    
    # Parse the result - for this simple endpoint, we'll just return the full text
    # and extract a concise refined idea from the first paragraph
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
    
    refined_idea = paragraphs[0] if paragraphs else content
    rationale = "\n\n".join(paragraphs[1:]) if len(paragraphs) > 1 else ""
    
    # If the refined idea is very long, it might be the entire response
    # In that case, take just the first sentence or two
    if len(refined_idea) > 150 and rationale == "":
        sentences = refined_idea.split('.')
        refined_idea = '.'.join(sentences[:2]) + '.'
        rationale = '.'.join(sentences[2:])
    
    return {
        "refined_idea": refined_idea,
        "rationale": rationale if rationale else "This refinement better targets the specified audience."
    }

def adapt_language(
    idea: Dict[str, Any],
    target_language: str,
    cultural_style: str = None,
    preserve_keywords: List[str] = None,
    tone_adjustment: str = None,
) -> Dict[str, Any]:
    """
    Adapt an idea to a different language and/or cultural style.
    
    Args:
        idea: The original idea dictionary (from generate_idea or IdeaResponse)
        target_language: The target language to translate to
        cultural_style: Specific cultural style within the language (optional)
        preserve_keywords: List of keywords to preserve in original language (optional)
        tone_adjustment: Adjustments to the tone for the target culture (optional)
        
    Returns:
        Dictionary containing the adapted idea with cultural notes
    """
    # Extract key components from the original idea
    headline = idea.get("headline", "")
    tagline = idea.get("tagline", "")
    value_proposition = idea.get("value_proposition", "")
    key_messages = idea.get("key_messages", [])
    
    # Build the system prompt
    system_prompt = f"""
    You are an expert multilingual marketing strategist with deep cultural knowledge. 
    Your task is to adapt content to {target_language}{' with ' + cultural_style + ' cultural style' if cultural_style else ''}.
    
    Follow these steps:
    1. Analyze the original content in English
    2. Deeply understand its meaning, emotion, and intent
    3. Adapt (not just translate) the content to {target_language}
    4. Ensure the adaptation resonates with {cultural_style if cultural_style else target_language}-speaking audiences
    5. Preserve the core message while making it culturally appropriate
    6. Add cultural nuances that would appeal to the target audience
    
    Your adaptation should feel natural to native speakers, not like a translation.
    """
    
    # Build the user message
    user_message = f"""
    Adapt the following marketing content to {target_language}{' with ' + cultural_style + ' cultural style' if cultural_style else ''}:
    
    HEADLINE: {headline}
    
    TAGLINE: {tagline}
    
    VALUE PROPOSITION: {value_proposition}
    
    KEY MESSAGES:
    {chr(10).join(['- ' + msg for msg in key_messages])}
    """
    
    if preserve_keywords:
        keywords_text = ", ".join(preserve_keywords)
        user_message += f"\n\nPRESERVE THESE KEYWORDS IN ORIGINAL LANGUAGE: {keywords_text}"
    
    if tone_adjustment:
        user_message += f"\n\nTONE ADJUSTMENTS: {tone_adjustment}"
    
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
    
    # Extract the content
    content = response.choices[0].message.content
    
    # Parse the response into structured sections using a modified version of parse_response
    # Initialize result with defaults from the adapted content
    result = {
        "headline": "",
        "tagline": "",
        "value_proposition": "",
        "key_messages": [],
        "language": target_language,
        "cultural_notes": None
    }
    
    if cultural_style:
        result["style"] = cultural_style
    
    # Parse the response into structured sections
    sections = {}
    current_section = None
    lines = content.lower().split('\n')
    
    # First pass: identify all sections and cultural notes
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        
        # Try to extract headline
        if "headline:" in line_lower:
            result["headline"] = content.split('\n')[i].split(":", 1)[1].strip()
        
        # Try to extract tagline
        elif "tagline:" in line_lower:
            result["tagline"] = content.split('\n')[i].split(":", 1)[1].strip()
        
        # Try to extract value proposition
        elif "value proposition:" in line_lower:
            result["value_proposition"] = content.split('\n')[i].split(":", 1)[1].strip()
        
        # Try to extract cultural notes
        elif "cultural note" in line_lower or "cultural adaptation" in line_lower:
            notes_index = i
            notes = []
            j = i
            # Gather all lines that appear to be part of the cultural notes
            while j < len(content.split('\n')) and not any(marker in content.split('\n')[j].lower() for marker in ["headline:", "tagline:", "value proposition:", "key message"]):
                if content.split('\n')[j].strip():
                    notes.append(content.split('\n')[j].strip())
                j += 1
            
            # Join all the notes, removing the "Cultural Notes:" prefix if present
            notes_text = '\n'.join(notes)
            if ":" in notes_text and notes_text.lower().startswith(("cultural note", "cultural adaptation")):
                notes_text = notes_text.split(":", 1)[1].strip()
            
            result["cultural_notes"] = notes_text
        
        # Try to extract key messages
        elif "key message" in line_lower or "key point" in line_lower:
            # Gather all lines that appear to be key messages
            messages = []
            j = i
            while j < len(content.split('\n')):
                current_line = content.split('\n')[j].strip()
                if current_line and (current_line.startswith("-") or current_line.startswith("•") or (j > i and current_line and not any(marker in current_line.lower() for marker in ["headline:", "tagline:", "value proposition:", "cultural note"]))):
                    # Clean up the message (remove leading dash or bullet)
                    message = current_line
                    if message.startswith(("-", "•", "*")):
                        message = message[1:].strip()
                    messages.append(message)
                
                # Stop if we hit another section
                if j > i and any(marker in current_line.lower() for marker in ["headline:", "tagline:", "value proposition:", "cultural note"]):
                    break
                
                j += 1
            
            result["key_messages"] = messages
    
    # If we couldn't extract structured data, make a best effort attempt
    if not result["headline"] and len(content.split('\n')) > 0:
        for line in content.split('\n'):
            if line.strip() and len(line.strip()) < 100:  # Reasonable headline length
                result["headline"] = line.strip()
                break
    
    # Ensure we have at least something in each field
    if not result["headline"]:
        result["headline"] = headline  # Use original if not found
    
    if not result["tagline"]:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.strip() and i > 0 and i < 5 and line != result["headline"]:
                result["tagline"] = line.strip()
                break
    
    if not result["value_proposition"]:
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if line.strip() and line not in [result["headline"], result["tagline"]] and len(line) > 20:
                result["value_proposition"] = line.strip()
                break
    
    # Clean up the key messages
    result["key_messages"] = [msg for msg in result["key_messages"] if msg and msg not in [result["headline"], result["tagline"], result["value_proposition"]]]
    
    # If no key messages found, extract from paragraphs
    if not result["key_messages"]:
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        for p in paragraphs:
            if p and p not in [result["headline"], result["tagline"], result["value_proposition"]]:
                # Split long paragraphs into sentences
                sentences = p.split('.')
                for s in sentences:
                    if s.strip() and len(s.strip()) > 10:
                        result["key_messages"].append(s.strip())
    
    return result 