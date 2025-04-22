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
    
    def _extract_structured_data(self, text, schema):
        """Extract structured data from text based on a provided schema."""
        system_prompt = """
        You are an expert data extraction system. Extract structured information from the text according to the provided schema.
        Return the extracted data as a valid JSON object that matches the schema exactly.
        """
        
        user_prompt = f"""
        Extract structured data from the following text according to this schema:
        {json.dumps(schema, indent=2)}
        
        TEXT:
        {text}
        
        Return ONLY the JSON object with the extracted information.
        """
        
        json_text = self._call_openai(system_prompt, user_prompt, temperature=0.1)
        
        # Clean up any markdown formatting
        json_text = re.sub(r'^```json\s*', '', json_text)
        json_text = re.sub(r'\s*```$', '', json_text)
        
        try:
            return json.loads(json_text)
        except json.JSONDecodeError:
            # Fallback if the JSON is invalid
            return {"error": "Failed to extract structured data", "raw_text": text}
    
    def _identify_industry(self, company_description, product_description):
        """Identify the industry based on company and product descriptions."""
        system_prompt = """
        You are an expert business analyst. Based on the company and product descriptions,
        identify the most specific industry category that applies.
        """
        
        user_prompt = f"""
        Company Description: {company_description}
        Product Description: {product_description}
        
        Based on this information, what industry and subcategory does this company belong to?
        """
        
        industry = self._call_openai(system_prompt, user_prompt, temperature=0.3)
        return industry
    
    def _get_adaptive_questions(self, initial_info, topic_type):
        """Generate adaptive questions based on initial information."""
        types = {
            "brand": "brand strategist understanding brand identity",
            "audience": "market researcher specializing in audience analysis",
            "product": "product analyst understanding product features and benefits",
            "competitors": "competitive analyst analyzing market positioning"
        }
        
        system_prompt = f"""
        You are an expert {types.get(topic_type, 'marketing consultant')}.
        Based on the initial information, generate 3-5 follow-up questions that would help
        gather more detailed information for creating an effective advertisement.
        
        The questions should be specific and targeted to uncover key insights.
        """
        
        user_prompt = f"""
        Initial information about {topic_type}: "{initial_info}"
        
        What follow-up questions would help gather more detailed information?
        """
        
        questions = self._call_openai(system_prompt, user_prompt)
        return questions
    
    def _conduct_interview(self, topic, initial_info):
        """Conduct an adaptive interview on a specific topic."""
        print(f"\n--- {topic.title()} Information Gathering ---")
        print(f"Initial description: {initial_info}\n")
        
        # Get adaptive questions
        questions = self._get_adaptive_questions(initial_info, topic)
        print(f"Follow-up questions:\n{questions}\n")
        
        # Get user answers
        answers = input("Please answer these questions (or type 'next' to move on): ")
        if answers.lower() == 'next':
            print("\nMoving on to the next section...\n")
            answers = "No additional information provided."
            
        self._add_to_history("user", f"{topic} information - Initial: {initial_info}, Additional: {answers}")
        
        # Define schema based on topic
        if topic == "brand":
            schema = {
                "name": "Brand name",
                "mission": "Brand mission statement",
                "values": ["List of brand values"],
                "unique_selling_proposition": "The USP",
                "brand_voice": "Brand voice and tone"
            }
        elif topic == "audience":
            schema = {
                "demographics": {
                    "age_range": "Age range",
                    "gender": "Gender distribution",
                    "income_level": "Income level",
                    "location": "Geographic location"
                },
                "psychographics": {
                    "values": ["Values"],
                    "interests": ["Interests"],
                    "pain_points": ["Pain points"]
                },
                "buying_behavior": "Buying behavior"
            }
        elif topic == "product":
            schema = {
                "name": "Product name",
                "features": ["Key features"],
                "benefits": ["Key benefits"],
                "pricing": "Pricing information",
                "unique_advantages": ["Unique advantages"]
            }
        elif topic == "competitors":
            schema = {
                "main_competitors": ["Main competitors"],
                "differentiation_strategy": "How to differentiate"
            }
        else:
            schema = {"summary": "Summary of information"}
        
        # Extract structured information
        print(f"\nAnalyzing {topic} information...")
        combined_info = f"{initial_info}\n\n{answers}"
        structured_info = self._extract_structured_data(combined_info, schema)
        
        return structured_info
    
