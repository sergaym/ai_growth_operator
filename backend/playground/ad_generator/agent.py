import os
import json
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

class AdGeneratorAgent:
    """
    An agent that specializes in creating high-quality commercial advertisements
    by asking follow-up questions to better understand the company, audience, and product.
    """
    
    def __init__(self, model="gpt-4-turbo"):
        """
        Initialize the AdGeneratorAgent.
        
        Args:
            model (str): OpenAI model to use, defaults to "gpt-4-turbo"
        """
        self.model = model
        self.conversation_history = []
        self.company_info = {}
        self.audience_info = {}
        self.product_info = {}
        
    def _add_to_history(self, role, content):
        """Add a message to the conversation history."""
        self.conversation_history.append({"role": role, "content": content})
        
    def _call_openai(self, system_prompt, user_prompt):
        """Make a call to the OpenAI API."""
        messages = [{"role": "system", "content": system_prompt}]
        messages.extend(self.conversation_history)
        messages.append({"role": "user", "content": user_prompt})
        
        response = openai.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
    
    def _ask_follow_up_questions(self, initial_info, info_type):
        """
        Ask follow-up questions to gather more detailed information.
        
        Args:
            initial_info (str): Initial information provided by the user
            info_type (str): Type of information (company, audience, or product)
            
        Returns:
            dict: Detailed information gathered through follow-up questions
        """
        # Set the appropriate system prompt based on info_type
        if info_type == "company":
            system_prompt = "You are an expert marketing consultant specializing in understanding companies and their brand identities. Ask 3-5 specific questions to understand the company's values, mission, tone, and market position better."
            initial_prompt = f"I need to create an advertisement for a company. Here's what I know so far: '{initial_info}'. What else should I know about this company to create an effective ad?"
        elif info_type == "audience":
            system_prompt = "You are an expert market researcher specializing in audience analysis. Ask 3-5 specific questions to understand the target audience's demographics, psychographics, pain points, and behaviors better."
            initial_prompt = f"I'm creating an ad targeting this audience: '{initial_info}'. What else should I know about this audience to create an effective ad?"
        elif info_type == "product":
            system_prompt = "You are an expert product analyst. Ask 3-5 specific questions to understand the product's features, benefits, unique selling points, and competitive advantages better."
            initial_prompt = f"I need to advertise this product: '{initial_info}'. What else should I know about this product to create an effective ad?"
        else:
            raise ValueError(f"Invalid info_type: {info_type}")
        
        # Get follow-up questions from OpenAI
        questions = self._call_openai(system_prompt, initial_prompt)
        print(f"\n--- Follow-up questions about the {info_type} ---\n{questions}\n")
        
        # Gather user answers
        answers = {}
        print(f"Please answer these questions to help create a better ad:")
        user_response = input("Enter your answers (or press Enter to skip): ")
        
        # Store the information
        detailed_info = {
            "initial_info": initial_info,
            "follow_up_answers": user_response if user_response else "No additional information provided."
        }
        
        return detailed_info
    
    def gather_information(self, company_description=None, target_audience=None, product_description=None):
        """
        Gather detailed information about the company, target audience, and product
        through an interactive Q&A process.
        
        Args:
            company_description (str, optional): Initial company description
            target_audience (str, optional): Initial target audience description
            product_description (str, optional): Initial product description
        """
        # Get initial information if not provided
        if not company_description:
            company_description = input("Enter company description: ")
        if not target_audience:
            target_audience = input("Enter target audience: ")
        if not product_description:
            product_description = input("Enter product description: ")
        
        # Gather detailed information through follow-up questions
        print("\nTo create the best possible ad, I'll ask some follow-up questions...\n")
        
        self.company_info = self._ask_follow_up_questions(company_description, "company")
        self.audience_info = self._ask_follow_up_questions(target_audience, "audience")
        self.product_info = self._ask_follow_up_questions(product_description, "product")
        
        # Add the gathered information to conversation history
        company_summary = f"Company Information: {company_description}\nAdditional details: {self.company_info['follow_up_answers']}"
        audience_summary = f"Target Audience: {target_audience}\nAdditional details: {self.audience_info['follow_up_answers']}"
        product_summary = f"Product Information: {product_description}\nAdditional details: {self.product_info['follow_up_answers']}"
        
        self._add_to_history("user", f"{company_summary}\n\n{audience_summary}\n\n{product_summary}")
    
    def generate_ad(self):
        """
        Generate a high-quality commercial ad based on the gathered information.
        
        Returns:
            str: A commercial ad script (max 1 minute)
        """
        system_prompt = """
        You are an expert copywriter who specializes in creating compelling commercial advertisements.
        You have a deep understanding of marketing psychology, persuasive language, and audience targeting.
        Create a highly effective 1-minute commercial ad script based on the detailed information provided.
        
        Your ad must:
        1. Grab attention in the first 5 seconds
        2. Clearly communicate the value proposition
        3. Speak directly to the target audience's needs and pain points
        4. Highlight the most compelling product benefits (not just features)
        5. Include a strong, clear call to action
        6. Be conversational and natural for voice delivery
        7. Include any necessary voice directions or sound effect notes
        
        Format the response as a complete script ready for recording.
        """
        
        user_prompt = """
        Based on all the information I've provided about the company, target audience, and product,
        please create the most effective 1-minute commercial ad script possible.
        """
        
        # Generate the ad
        ad_script = self._call_openai(system_prompt, user_prompt)
        self._add_to_history("assistant", ad_script)
        
        return ad_script
    
    def refine_ad(self, feedback):
        """
        Refine the generated ad based on user feedback.
        
        Args:
            feedback (str): User feedback on the generated ad
            
        Returns:
            str: An improved commercial ad script
        """
        self._add_to_history("user", f"Please refine the ad based on this feedback: {feedback}")
        
        system_prompt = """
        You are an expert copywriter who specializes in revising commercial advertisements based on feedback.
        Take the previously generated ad and the user's feedback to create an improved version.
        Maintain the same 1-minute length constraint and all the qualities of an effective ad.
        """
        
        user_prompt = "Please refine the previously generated ad based on my feedback."
        
        # Generate the refined ad
        refined_ad = self._call_openai(system_prompt, user_prompt)
        self._add_to_history("assistant", refined_ad)
        
        return refined_ad


if __name__ == "__main__":
    # Example usage
    print("=== Ad Generator Agent ===")
    print("This agent will help create a high-quality commercial ad by asking follow-up questions\n")
    
    agent = AdGeneratorAgent()
    
    # Gather detailed information
    agent.gather_information()
    
    # Generate the ad
    print("\nGenerating your commercial ad...\n")
    ad_script = agent.generate_ad()
    
    print("\n=== GENERATED COMMERCIAL AD (1 MINUTE) ===\n")
    print(ad_script)
    print("\n===========================================\n")
    
    # Offer refinement option
    refine = input("Would you like to refine this ad? (yes/no): ")
    if refine.lower() in ["yes", "y"]:
        feedback = input("What would you like to improve about this ad? ")
        refined_ad = agent.refine_ad(feedback)
        
        print("\n=== REFINED COMMERCIAL AD (1 MINUTE) ===\n")
        print(refined_ad)
        print("\n===========================================\n") 