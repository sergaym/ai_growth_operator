import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_commercial_ad(company_description, target_audience, product_description):
    """
    Generate a commercial ad script (max 1 minute) based on company description,
    target audience, and product description using OpenAI.
    
    Args:
        company_description (str): Description of the company
        target_audience (str): Description of the target audience
        product_description (str): Description of the product being sold
        
    Returns:
        str: A commercial ad script (max 1 minute)
    """
    # Craft a prompt for the OpenAI model
    prompt = f"""
    Create a compelling commercial ad script (maximum 1 minute when read aloud) based on the following:
    
    COMPANY: {company_description}
    
    TARGET AUDIENCE: {target_audience}
    
    PRODUCT: {product_description}
    
    The ad should be engaging, memorable, and persuasive. It should clearly communicate the value proposition 
    and include a strong call to action. Make it conversational and natural for voice delivery.
    
    Format the response as a complete script ready for recording, with clear voice directions if needed.
    """
    
    # Generate content using OpenAI's GPT-4
    response = openai.chat.completions.create(
        model="gpt-4-turbo",  # Using GPT-4 for highest quality
        messages=[
            {"role": "system", "content": "You are an expert copywriter who specializes in creating compelling commercial advertisements."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,  # Limiting to approximately 1 minute of spoken content
        temperature=0.7  # Balancing creativity with coherence
    )
    
    # Extract and return the generated ad
    return response.choices[0].message.content.strip()

