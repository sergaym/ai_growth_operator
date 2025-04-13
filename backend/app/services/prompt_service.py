"""
Prompt service for the AI Growth Operator.
This module provides functionality for enhancing and formatting prompts for content generation.
"""

from typing import List, Dict, Any, Optional

# Pre-defined prompt templates for different video styles
VIDEO_STYLE_TEMPLATES = {
    "cinematic": "Cinematic shot of {prompt}, with dramatic lighting, shallow depth of field, and professional film grain. Shot on a high-end cinema camera.",
    "3d_animation": "3D animated render of {prompt}. Highly detailed, volumetric lighting, subsurface scattering, global illumination, ray tracing, 8K textures.",
    "vintage": "Vintage film footage from the 1970s of {prompt}. Film grain, warm colors, slightly washed out look, 16mm film aesthetic.",
    "futuristic": "Futuristic visualization of {prompt}. Neon lights, holographic elements, sci-fi aesthetic, advanced technology, sleek design.",
    "nature_documentary": "Nature documentary footage of {prompt}. Beautiful natural lighting, pristine environment, David Attenborough style, high definition capture.",
    "stop_motion": "Stop motion animation of {prompt}. Handcrafted look, slightly jerky movement, tactile textures, studio lighting.",
    "drone_footage": "Aerial drone footage of {prompt}. Sweeping camera movements, bird's eye view, expansive landscape, stable smooth motion.",
    "security_camera": "Security camera footage of {prompt}. Grainy image quality, fixed camera angle, date/time stamp in corner, slight fish-eye lens effect.",
    "vaporwave": "Vaporwave aesthetic video of {prompt}. 80s and 90s influence, glitch effects, purple and teal color palette, retro computer graphics."
}

# Pre-defined camera motion templates
CAMERA_MOTION_TEMPLATES = {
    "pan_left": "{prompt}, camera panning left slowly",
    "pan_right": "{prompt}, camera panning right slowly",
    "zoom_in": "{prompt}, camera zooming in slowly",
    "zoom_out": "{prompt}, camera zooming out, revealing more of the scene",
    "dolly_in": "{prompt}, camera dollying in towards the subject",
    "dolly_out": "{prompt}, camera dollying out away from the subject",
    "tracking": "{prompt}, camera tracking alongside the subject",
    "crane_up": "{prompt}, camera craning upward, rising view",
    "crane_down": "{prompt}, camera craning downward",
    "stationary": "{prompt}, fixed camera, no movement"
}

def format_with_style(base_prompt: str, style: str = None) -> str:
    """
    Format a prompt with a predefined style template.
    
    Args:
        base_prompt: The core prompt describing what to generate
        style: The name of the style template to use
        
    Returns:
        Formatted prompt with the style applied
    """
    if not style or style not in VIDEO_STYLE_TEMPLATES:
        return base_prompt
        
    return VIDEO_STYLE_TEMPLATES[style].format(prompt=base_prompt)

def format_with_camera_motion(base_prompt: str, camera_motion: str = None) -> str:
    """
    Format a prompt with a predefined camera motion.
    
    Args:
        base_prompt: The core prompt describing what to generate
        camera_motion: The name of the camera motion to apply
        
    Returns:
        Formatted prompt with the camera motion applied
    """
    if not camera_motion or camera_motion not in CAMERA_MOTION_TEMPLATES:
        return base_prompt
        
    return CAMERA_MOTION_TEMPLATES[camera_motion].format(prompt=base_prompt)

def enhance_prompt(
    base_prompt: str, 
    style: str = None, 
    camera_motion: str = None,
    additional_details: str = None
) -> str:
    """
    Enhance a prompt with style, camera motion, and additional details.
    
    Args:
        base_prompt: The core prompt describing what to generate
        style: The name of the style template to use
        camera_motion: The name of the camera motion to apply
        additional_details: Any additional details to append to the prompt
        
    Returns:
        Enhanced prompt
    """
    # Apply style first if provided
    current_prompt = format_with_style(base_prompt, style) if style else base_prompt
    
    # Apply camera motion if provided
    if camera_motion:
        # If we already applied a style, we need to use the styled prompt as the base
        if style:
            # Extract the camera motion template and apply it directly
            camera_template = CAMERA_MOTION_TEMPLATES[camera_motion].replace("{prompt}, ", "")
            current_prompt = f"{current_prompt}, {camera_template}"
        else:
            current_prompt = format_with_camera_motion(base_prompt, camera_motion)
    
    # Append additional details if provided
    if additional_details:
        current_prompt = f"{current_prompt}. {additional_details}"
    
    return current_prompt

def get_available_styles() -> List[str]:
    """
    Get a list of available style templates.
    
    Returns:
        List of style template names
    """
    return list(VIDEO_STYLE_TEMPLATES.keys())

def get_available_camera_motions() -> List[str]:
    """
    Get a list of available camera motion templates.
    
    Returns:
        List of camera motion template names
    """
    return list(CAMERA_MOTION_TEMPLATES.keys()) 