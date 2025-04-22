import os
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

def generate_commercial_ad(company_description, target_audience, product_description, model="gpt-4-turbo"):
    """
    Generate a commercial ad script (max 1 minute) based on company description,
    target audience, and product description using OpenAI.
    
    Args:
        company_description (str): Description of the company
        target_audience (str): Description of the target audience
        product_description (str): Description of the product being sold
        model (str): OpenAI model to use for generation, defaults to "gpt-4-turbo"
        
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
    
    # Generate content using OpenAI
    response = openai.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are an expert copywriter who specializes in creating compelling commercial advertisements."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=500,  # Limiting to approximately 1 minute of spoken content
        temperature=0.7  # Balancing creativity with coherence
    )
    
    # Extract and return the generated ad
    return response.choices[0].message.content.strip()

if __name__ == "__main__":
    # Example usage
    company = input("Enter company description: ")
    audience = input("Enter target audience: ")
    product = input("Enter product description: ")
    model = input("Enter OpenAI model (press Enter for default 'gpt-4-turbo'): ") or "gpt-4-turbo"
    
    ad_script = generate_commercial_ad(company, audience, product, model)
    
    print(f"\n=== GENERATED COMMERCIAL AD (1 MINUTE) USING {model} ===\n")
    print(ad_script)
    print("\n===========================================\n")


# Example usage
# company_description = "A tech startup that develops innovative AI solutions for businesses"
# target_audience = "Spanish-speaking from Spain, small business owners who want to improve customer engagement and sales"
# product_description = "An AI-powered chatbot that can help businesses automate customer support and sales"
