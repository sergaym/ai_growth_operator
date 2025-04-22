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
    
    def gather_information(self, initial_company=None, initial_audience=None, initial_product=None):
        """Conduct a comprehensive information gathering process."""
        print("\n===== AD GENERATOR PROFESSIONAL DIRECTOR =====")
        print("This agent will guide you through creating a high-quality commercial ad script.\n")
        
        # Get initial information if not provided
        if not initial_company:
            initial_company = input("Enter company/brand description: ")
        if not initial_product:
            initial_product = input("Enter product/service description: ")
        if not initial_audience:
            initial_audience = input("\nEnter target audience description: ")
            
        # Identify industry to guide the process
        print("\nAnalyzing your business to identify the industry...")
        self.industry = self._identify_industry(initial_company, initial_product)
        print(f"Identified industry: {self.industry}\n")
        
        # Gather detailed information through adaptive interviews
        self.creative_brief["brand"] = self._conduct_interview("brand", initial_company)
        self.creative_brief["audience"] = self._conduct_interview("audience", initial_audience)
        self.creative_brief["product"] = self._conduct_interview("product", initial_product)
        
        # Get competitor information
        print("\n--- Competitor Analysis ---")
        competitor_info = input("Please describe your main competitors and how you differentiate: ")
        self.creative_brief["competitors"] = self._extract_structured_data(
            competitor_info, 
            {"main_competitors": ["List of competitors"], "differentiation": "Differentiation strategy"}
        )
        
        # Get campaign objectives
        print("\n--- Campaign Objectives ---")
        objectives_info = input("What are the primary objectives for this ad campaign? ")
        self.creative_brief["objectives"] = self._extract_structured_data(
            objectives_info,
            {"primary_objective": "Primary objective", "secondary_objectives": ["Secondary objectives"]}
        )
        
        # Get tone and style preferences
        print("\n--- Tone and Style ---")
        tone_info = input("What tone and style should the ad have? Any examples you like? ")
        self.creative_brief["tone_and_style"] = self._extract_structured_data(
            tone_info,
            {"tone": "Tone", "style": "Style", "examples": ["Examples"]}
        )
        
        # Generate creative brief
        creative_brief = self._generate_creative_brief()
        print("\n=== CREATIVE BRIEF ===\n")
        print(creative_brief)
        print("\n=======================\n")
        
        return creative_brief
    
    def _generate_creative_brief(self):
        """Generate a professional creative brief based on gathered information."""
        system_prompt = """
        You are an expert creative director specializing in creating comprehensive creative briefs.
        Create a professional creative brief based on all the gathered information.
        
        Include sections for Project Overview, Brand Background, Target Audience, Product Details,
        Competitive Landscape, Campaign Objectives, Tone and Style, and Key Message.
        """
        
        user_prompt = f"""
        Based on all the information gathered, please create a comprehensive creative brief for this ad campaign.
        
        BRAND: {json.dumps(self.creative_brief["brand"], indent=2)}
        
        AUDIENCE: {json.dumps(self.creative_brief["audience"], indent=2)}
        
        PRODUCT: {json.dumps(self.creative_brief["product"], indent=2)}
        
        COMPETITORS: {json.dumps(self.creative_brief["competitors"], indent=2)}
        
        OBJECTIVES: {json.dumps(self.creative_brief["objectives"], indent=2)}
        
        TONE AND STYLE: {json.dumps(self.creative_brief["tone_and_style"], indent=2)}
        
        INDUSTRY: {self.industry}
        """
        
        # Generate the creative brief
        creative_brief = self._call_openai(system_prompt, user_prompt, temperature=0.7)
        return creative_brief
    
    def generate_ad_variations(self, num_variations=3):
        """Generate multiple ad script variations based on the creative brief."""
        if not self.creative_brief["brand"]:
            print("No information gathered yet. Please run gather_information() first.")
            return []
        
        # Generate a creative brief if not already done
        creative_brief = self._generate_creative_brief()
        
        # Different approaches for variations
        approaches = [
            "Create an emotional and narrative-driven ad that tells a compelling story",
            "Create a direct and benefit-focused ad that clearly communicates value",
            "Create a problem-solution format ad that highlights pain points and resolution"
        ]
        
        print(f"\nGenerating {num_variations} ad script variations...")
        
        system_prompt = """
        You are an expert copywriter who specializes in creating compelling commercial advertisements.
        Create a highly effective 1-minute commercial ad script based on the creative brief provided.
        
        Your ad must:
        1. Grab attention in the first 5 seconds
        2. Clearly communicate the value proposition
        3. Speak directly to the target audience's needs and pain points
        4. Highlight the most compelling product benefits
        5. Include a strong call to action
        6. Be conversational and natural for voice delivery
        7. Include any necessary voice directions or sound effect notes
        """
        
        # Generate variations
        self.ad_variations = []
        for i in range(min(num_variations, len(approaches))):
            user_prompt = f"""
            Based on this creative brief:
            
            {creative_brief}
            
            {approaches[i]}.
            The ad should be approximately 1 minute when read aloud.
            """
            
            # Generate the ad variation
            ad_script = self._call_openai(system_prompt, user_prompt, temperature=0.8)
            
            variation = {
                "id": i + 1,
                "approach": approaches[i].replace("Create ", ""),
                "script": ad_script
            }
            
            self.ad_variations.append(variation)
            
            # Display the variation
            print(f"\n=== AD VARIATION {variation['id']}: {variation['approach']} ===\n")
            print(variation["script"])
            print("\n=======================\n")
        
        return self.ad_variations
    
    def select_and_refine_ad(self):
        """Allow the user to select an ad variation and optionally refine it."""
        if not self.ad_variations:
            print("No ad variations generated yet. Please run generate_ad_variations() first.")
            return ""
        
        # Let user select a variation
        selection = input(f"Select an ad variation (1-{len(self.ad_variations)}): ")
        try:
            selection_id = int(selection)
            if selection_id < 1 or selection_id > len(self.ad_variations):
                raise ValueError
        except ValueError:
            print("Invalid selection. Using variation 1.")
            selection_id = 1
        
        # Find the selected variation
        for variation in self.ad_variations:
            if variation["id"] == selection_id:
                self.selected_variation = variation
                break
        else:
            self.selected_variation = self.ad_variations[0]
        
        print(f"\nYou selected Variation {self.selected_variation['id']}: {self.selected_variation['approach']}\n")
        
        # Ask if the user wants to refine the ad
        refine = input("Would you like to refine this ad? (yes/no): ")
        if refine.lower() in ["yes", "y"]:
            feedback = input("What specific aspects would you like to improve or change? ")
            
            system_prompt = """
            You are an expert copywriter who specializes in revising commercial advertisements based on feedback.
            Take the previously generated ad and the user's feedback to create an improved version.
            Maintain the same 1-minute length constraint and all the qualities of an effective ad.
            """
            
            user_prompt = f"""
            Here is the original ad script:
            
            {self.selected_variation["script"]}
            
            Please refine this ad based on the following feedback:
            
            {feedback}
            
            Provide a revised version that incorporates this feedback while maintaining all the strengths of the original.
            """
            
            # Generate the refined ad
            print("\nRefining the selected ad script...")
            refined_ad = self._call_openai(system_prompt, user_prompt, temperature=0.7)
            
            print("\n=== REFINED AD SCRIPT ===\n")
            print(refined_ad)
            print("\n=======================\n")
            
            return refined_ad
        else:
            return self.selected_variation["script"]


if __name__ == "__main__":
    # Example usage
    agent = AdvancedAdGeneratorAgent()
    
    # Guide the user through the entire process
    creative_brief = agent.gather_information()
    ad_variations = agent.generate_ad_variations(3)
    final_ad = agent.select_and_refine_ad() 