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

class RealisticActorGenerator:
    """
    Realistic human actor generator that creates images of photorealistic humans based on target audience analysis.
    Uses audience insights to generate actors that will resonate with the intended demographic.
    Optimized for creating realistic human actors suitable for advertising and marketing campaigns.
    """
    
    def __init__(self, model="gpt-4-turbo", image_model="dall-e-3"):
        """
        Initialize the RealisticActorGenerator.
        
        Args:
            model (str): OpenAI text model to use for analysis, defaults to "gpt-4-turbo"
            image_model (str): OpenAI image model to use for generation, defaults to "dall-e-3"
        """
        self.text_model = model
        self.image_model = image_model
        self.conversation_history = []
        self.audience_profile = {}
        self.brand_profile = {}
        self.actor_profile = {}
        self.actor_variations = []
        self.selected_actor = None
        self.output_dir = os.path.join("backend", "playground", "avatar_creation", "output")
        
        # Define actor types that appeal to different audiences
        self.actor_types = {
            "professional": {
                "name": "Professional",
                "description": "Corporate professional with business attire, suitable for B2B services",
            },
            "casual": {
                "name": "Casual/Lifestyle",
                "description": "Approachable person with casual attire, for lifestyle and consumer products",
            },
            "expert": {
                "name": "Industry Expert",
                "description": "Authoritative figure with professional appearance specific to an industry",
            },
            "aspirational": {
                "name": "Aspirational",
                "description": "Successful, attractive person representing an ideal or aspiration",
            },
            "relatable": {
                "name": "Relatable Everyday Person",
                "description": "Average, down-to-earth person that viewers can easily identify with",
            }
        }
        
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
    
    def _generate_image(self, prompt, size="1024x1024"):
        """Generate an image using OpenAI's DALL-E model."""
        try:
            response = openai.images.generate(
                model=self.image_model,
                prompt=prompt,
                size=size,
                quality="hd",  # HD for better photorealism
                style="natural",  # Natural style for realistic humans
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
        relevant for creating a realistic human actor/model that would appeal to this audience for advertising.
        
        Generate a detailed audience profile in JSON format with the following sections:
        1. Demographics (age range, gender distribution, income level, education, occupation, location)
        2. Psychographics (values, interests, lifestyle, personality traits)
        3. Visual preferences (visual style, actor types they respond to, aesthetics)
        4. Representation preferences (would they respond better to someone similar to them or aspirational)
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
        You are an expert brand strategist and casting director. Your task is to analyze a brand description 
        and extract key characteristics that would be relevant for selecting an actor/model to represent this brand.
        
        Generate a detailed brand profile in JSON format with the following sections:
        1. Brand identity (name, mission, values, personality)
        2. Visual identity (color palette, visual style, aesthetic)
        3. Tone and voice (how the brand communicates)
        4. Target market positioning
        5. Actor/spokesperson qualities that would align with this brand (specific traits, appearance, demeanor)
        
        Use the provided description to make educated inferences where explicit information is not provided.
        """
        
        user_prompt = f"""
        Based on this brand description, create a detailed brand profile with focus on what type of actor/model would best represent this brand:
        
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
    
    def _recommend_actor_type(self):
        """
        Recommend the most suitable actor type based on audience and brand profiles.
        
        Returns:
            str: Recommended actor type key
        """
        system_prompt = """
        You are an expert casting director for advertising. Based on the audience and brand profiles,
        recommend the most suitable actor type from the following options:
        
        1. professional - Corporate professional with business attire
        2. casual - Approachable person with casual attire for lifestyle products
        3. expert - Authoritative industry expert
        4. aspirational - Successful, attractive person representing an ideal
        5. relatable - Average, down-to-earth person viewers can identify with
        
        Consider the target audience preferences, brand identity, and marketing objectives.
        Provide your recommendation as a single key from the options above, followed by a brief explanation of why.
        """
        
        user_prompt = f"""
        Based on this audience profile:
        {json.dumps(self.audience_profile, indent=2)}
        
        And this brand profile:
        {json.dumps(self.brand_profile, indent=2)}
        
        Which actor type would be most effective for this brand and audience?
        """
        
        # Get the recommendation
        recommendation = self._call_openai(system_prompt, user_prompt, temperature=0.5)
        
        # Extract the format key from the response (first word)
        actor_type_key = recommendation.split(' ')[0].lower().strip()
        
        # Validate the key is in our actor types
        if actor_type_key in self.actor_types:
            return actor_type_key
        else:
            # Default to relatable if we can't determine from the response
            return "relatable"
    
    def _determine_actor_profile(self):
        """
        Determine the optimal actor characteristics based on audience and brand profiles.
        
        Returns:
            Dict: Actor profile specifications
        """
        # Add the selected actor type to the prompt
        actor_type_info = self.actor_types[self.actor_type]
        
        system_prompt = f"""
        You are an expert casting director specializing in finding the perfect actor for advertising campaigns.
        Your task is to determine the optimal characteristics for a {actor_type_info['name']} actor that will represent 
        a brand to a specific target audience.
        
        The actor will be used in advertising and possibly as a video spokesperson, so they need to have:
        - Clear, attractive facial features with good symmetry
        - Professional, appropriate appearance for the brand
        - Demographic characteristics that will resonate with the target audience
        - Expression and demeanor aligned with brand values
        - Appropriate styling (clothing, hair, accessories)
        
        Based on the audience profile and brand profile, generate detailed actor specifications in JSON format:
        1. Actor type: {actor_type_info['name']}
        2. Demographics (age range, gender, ethnicity)
        3. Physical characteristics (appearance, build, distinctive features)
        4. Styling (clothing, accessories, grooming)
        5. Expression and demeanor (friendly, professional, confident, etc.)
        6. Setting/background for the actor
        7. Pose and framing (head and shoulders, full body, etc.)
        
        Provide a clear rationale for each choice, explaining how it aligns with both the audience and brand.
        """
        
        user_prompt = f"""
        Based on this audience profile:
        {json.dumps(self.audience_profile, indent=2)}
        
        And this brand profile:
        {json.dumps(self.brand_profile, indent=2)}
        
        Determine the optimal characteristics for a {actor_type_info['name']} actor that would resonate with this audience 
        while appropriately representing the brand.
        
        Please provide the specifications in structured JSON format.
        """
        
        # Get the actor profile analysis
        analysis_text = self._call_openai(system_prompt, user_prompt, temperature=0.7)
        
        # Try to parse the JSON response
        try:
            # Clean up any markdown formatting
            analysis_text = analysis_text.replace("```json", "").replace("```", "").strip()
            actor_profile = json.loads(analysis_text)
            return actor_profile
        except json.JSONDecodeError:
            # If parsing fails, extract structured data manually
            return {
                "raw_analysis": analysis_text,
                "error": "Failed to parse structured data"
            }
    
    def _generate_image_prompt(self, variation_type="standard"):
        """
        Generate a detailed prompt for photorealistic human actor generation.
        
        Args:
            variation_type (str): Type of variation to generate
                                 ("standard", "professional", "friendly", "dynamic")
            
        Returns:
            str: Detailed image generation prompt
        """
        variation_prompts = {
            "standard": "Create a standard portrayal of the actor that balances professionalism and approachability",
            "professional": "Create a more formal, business-oriented portrayal of the actor",
            "friendly": "Create a warm, approachable portrayal of the actor",
            "dynamic": "Create an active, dynamic portrayal of the actor in context"
        }
        
        # Get actor type info
        actor_type_info = self.actor_types[self.actor_type]
        
        system_prompt = f"""
        You are an expert prompt engineer specializing in creating detailed, effective prompts for photorealistic human portraits.
        Your task is to craft a detailed prompt that will generate a highly realistic {actor_type_info['name']} actor image 
        that meets these requirements:

        1. Photorealistic human with natural features (avoid AI-looking faces)
        2. Professional quality portrait photography
        3. Clear facial details with appropriate skin texture
        4. Natural lighting that flatters the subject
        5. Appropriate expression that conveys the brand personality
        6. High-quality, realistic clothing and accessories
        7. Proper depth of field and professional composition
        
        The prompt should be comprehensive, specific, and include:
        1. Detailed description of the person (appearance, age, ethnicity, etc.)
        2. Specific photography style (portrait, environmental, etc.)
        3. Lighting specifications (soft, dramatic, natural, etc.)
        4. Background/setting details
        5. Expression and pose
        6. Clothing and styling
        7. Technical specifications (e.g., "professional portrait photography", "85mm lens", "studio lighting")
        
        Make your prompt extremely detailed but focus on creating an image that looks like a real human photograph, 
        not an AI-generated image. Use descriptive language like "professional portrait photograph of..." 
        or "high-end commercial photography of..." to guide the image generation.
        
        NEVER use terms like "AI-generated", "hyperrealistic", or "photorealistic" in your prompt.
        INSTEAD, use terms that real photographers would use: "sharp focus", "shallow depth of field",
        "studio lighting", "environmental portrait", etc.
        
        Be specific with details but natural in description.
        """
        
        user_prompt = f"""
        Using these actor specifications:
        {json.dumps(self.actor_profile, indent=2)}
        
        And this variation instruction: "{variation_prompts.get(variation_type, variation_prompts['standard'])}"
        
        Generate a detailed, specific prompt for creating a photograph of a real human actor that will:
        1. Resonate with the target audience and represent the brand effectively
        2. Look like a professional photograph of a real person, not an AI-generated image
        3. Have the characteristics determined in the actor specifications
        
        The prompt should be ready to send directly to an AI image generation system to create a realistic human photograph.
        """
        
        # Get the image generation prompt
        image_prompt = self._call_openai(system_prompt, user_prompt, temperature=0.7)
        
        # Add photography terms to enhance realism
        photography_suffix = "Professional photography, Canon EOS, natural lighting, depth of field, sharp focus, high resolution, color grading, professional model, authentic, 4K, detailed features"
        
        # Return the prompt with photography terms and explicit instruction to avoid AI artifacts
        return f"{image_prompt} {photography_suffix}. This should look like a real human photograph, not AI-generated. No uncanny valley effects, no strange hands, no odd features."
    
    def analyze_audience_and_brand(self, audience_description, brand_description):
        """
        Analyze the target audience and brand to prepare for actor generation.
        
        Args:
            audience_description (str): Description of the target audience
            brand_description (str): Description of the brand
            
        Returns:
            Tuple[Dict, Dict]: Audience profile and brand profile
        """
        print("\n===== AUDIENCE ANALYSIS =====")
        print("Analyzing target audience...")
        self.audience_profile = self._analyze_audience(audience_description)
        
        print("\n===== BRAND ANALYSIS =====")
        print("Analyzing brand identity...")
        self.brand_profile = self._analyze_brand(brand_description)
        
        print("\n===== ACTOR TYPE RECOMMENDATION =====")
        print("Recommending optimal actor type...")
        self.actor_type = self._recommend_actor_type()
        actor_type_info = self.actor_types[self.actor_type]
        print(f"Recommended actor type: {actor_type_info['name']}")
        print(f"Description: {actor_type_info['description']}")
        
        # Allow user to override the recommendation
        print("\nAvailable actor types:")
        for key, info in self.actor_types.items():
            print(f"- {key}: {info['name']} - {info['description']}")
        
        override = input("\nWould you like to use a different actor type? (Enter type key or leave empty to use recommendation): ")
        if override and override in self.actor_types:
            self.actor_type = override
            actor_type_info = self.actor_types[self.actor_type]
            print(f"Selected actor type: {actor_type_info['name']}")
        
        print("\n===== ACTOR PROFILE DETERMINATION =====")
        print("Determining optimal actor characteristics...")
        self.actor_profile = self._determine_actor_profile()
        
        return self.audience_profile, self.brand_profile
    
    def generate_actor_variations(self, num_variations=4):
        """
        Generate multiple actor variations based on the audience and brand analysis.
        
        Args:
            num_variations (int): Number of variations to generate
            
        Returns:
            List[Dict]: List of actor variations with image URLs
        """
        if not self.audience_profile or not self.brand_profile or not self.actor_profile:
            print("No audience or brand analysis found. Please run analyze_audience_and_brand() first.")
            return []
        
        variation_types = ["standard", "professional", "friendly", "dynamic"]
        self.actor_variations = []
        
        print("\n===== GENERATING ACTOR VARIATIONS =====")
        print(f"Creating {num_variations} variations of {self.actor_types[self.actor_type]['name']} actor...")
        
        for i in range(min(num_variations, len(variation_types))):
            variation_type = variation_types[i]
            print(f"\nGenerating {variation_type} actor variation...")
            
            # Generate image prompt
            image_prompt = self._generate_image_prompt(variation_type)
            
            print(f"Prompt: {image_prompt[:100]}..." if len(image_prompt) > 100 else f"Prompt: {image_prompt}")
            
            # Generate the image
            image_url = self._generate_image(image_prompt)
            
            if image_url:
                # Save the image
                timestamp = int(time.time())
                filename = f"actor_{self.actor_type}_{variation_type}_{timestamp}.png"
                saved_path = self._save_image_from_url(image_url, filename)
                
                variation = {
                    "id": i + 1,
                    "type": variation_type,
                    "actor_type": self.actor_type,
                    "prompt": image_prompt,
                    "image_url": image_url,
                    "local_path": saved_path
                }
                
                self.actor_variations.append(variation)
                print(f"Generated {variation_type} actor: {saved_path}")
            else:
                print(f"Failed to generate {variation_type} actor")
        
        return self.actor_variations
    
    def select_and_refine_actor(self):
        """
        Allow selection of an actor variation and optional refinement.
        
        Returns:
            Dict: Selected and possibly refined actor
        """
        if not self.actor_variations:
            print("No actor variations generated. Please run generate_actor_variations() first.")
            return None
        
        print("\n===== SELECT ACTOR =====")
        for variation in self.actor_variations:
            print(f"{variation['id']}. {variation['type'].capitalize()} {self.actor_types[variation['actor_type']]['name']}: {variation['local_path']}")
        
        # Let user select a variation
        selection = input(f"Select an actor variation (1-{len(self.actor_variations)}): ")
        try:
            selection_id = int(selection)
            if selection_id < 1 or selection_id > len(self.actor_variations):
                raise ValueError
        except ValueError:
            print("Invalid selection. Using variation 1.")
            selection_id = 1
        
        # Find the selected variation
        for variation in self.actor_variations:
            if variation["id"] == selection_id:
                self.selected_actor = variation
                break
        else:
            self.selected_actor = self.actor_variations[0]
        
        print(f"\nYou selected the {self.selected_actor['type']} {self.actor_types[self.selected_actor['actor_type']]['name']} actor\n")
        
        # Ask if the user wants to refine the actor
        refine = input("Would you like to refine this actor? (yes/no): ")
        if refine.lower() in ["yes", "y"]:
            feedback = input("What specific aspects would you like to improve or change? ")
            
            system_prompt = f"""
            You are an expert prompt engineer specializing in refining image generation prompts for photorealistic human portraits.
            Your task is to modify an existing prompt based on user feedback to create an improved version
            that addresses the requested changes while maintaining the core elements of the original.
            
            Focus on creating a prompt that will generate an image that looks like a real photograph of a real person.
            Avoid any language that might make the result look AI-generated or uncanny.
            
            Use terms that real photographers would use: "sharp focus", "shallow depth of field",
            "studio lighting", "environmental portrait", etc.
            """
            
            user_prompt = f"""
            Original prompt: 
            {self.selected_actor['prompt']}
            
            User feedback: 
            {feedback}
            
            Please create a refined prompt that incorporates this feedback while maintaining 
            the core elements and style of the original, ensuring it will result in a realistic-looking 
            photograph of a human actor.
            """
            
            # Generate the refined prompt
            print("\nRefining actor prompt...")
            refined_prompt = self._call_openai(system_prompt, user_prompt, temperature=0.7)
            
            # Add photography terms to enhance realism
            photography_suffix = "Professional photography, Canon EOS, natural lighting, depth of field, sharp focus, high resolution, color grading, professional model, authentic, 4K, detailed features"
            refined_prompt = f"{refined_prompt} {photography_suffix}. This should look like a real human photograph, not AI-generated. No uncanny valley effects, no strange hands, no odd features."
            
            # Generate new image
            print("Generating refined actor image...")
            refined_image_url = self._generate_image(refined_prompt)
            
            if refined_image_url:
                # Save the refined image
                timestamp = int(time.time())
                filename = f"actor_{self.selected_actor['actor_type']}_refined_{timestamp}.png"
                saved_path = self._save_image_from_url(refined_image_url, filename)
                
                refined_actor = {
                    "id": self.selected_actor["id"],
                    "type": f"{self.selected_actor['type']}_refined",
                    "actor_type": self.selected_actor['actor_type'],
                    "prompt": refined_prompt,
                    "image_url": refined_image_url,
                    "local_path": saved_path,
                    "original": self.selected_actor,
                    "feedback": feedback
                }
                
                print(f"Generated refined actor: {saved_path}")
                return refined_actor
            else:
                print("Failed to generate refined actor, returning original selection")
                return self.selected_actor
        else:
            return self.selected_actor
    
    def get_advertising_usage_tips(self):
        """
        Provide tips for using the generated actor in advertising.
        
        Returns:
            str: Tips for using the actor in advertising
        """
        if not self.selected_actor:
            return "No actor selected. Please select an actor first."
            
        actor_type_key = self.selected_actor["actor_type"]
        actor_type_info = self.actor_types[actor_type_key]
        
        system_prompt = f"""
        You are an expert in advertising and casting.
        Provide practical tips for using the generated {actor_type_info['name']} actor in advertising campaigns.
        
        Include advice on:
        1. Best advertising formats for this actor type
        2. How to use this actor effectively for the specific audience
        3. Potential marketing channels where this actor would perform best
        4. How to align messaging with the actor's appearance and style
        5. How to maximize audience connection with this actor type
        
        Be concise and practical.
        """
        
        user_prompt = f"""
        This actor was generated with the following specifications:
        - Actor type: {actor_type_info['name']}
        - Actor details: {json.dumps(self.actor_profile, indent=2) if isinstance(self.actor_profile, dict) else 'Custom profile'}
        - Target audience: {json.dumps(self.audience_profile, indent=2) if isinstance(self.audience_profile, dict) else 'Custom audience'}
        
        What are the best practices for using this actor in advertising to connect with the target audience?
        """
        
        # Get usage tips
        tips = self._call_openai(system_prompt, user_prompt, temperature=0.7)
        return tips


if __name__ == "__main__":
    # Example usage
    generator = RealisticActorGenerator()
    
    # Get user input
    print("===== PROFESSIONAL ACTOR GENERATOR FOR ADVERTISING =====")
    print("This tool will help you create images of realistic human actors that resonate with your target audience")
    print("and effectively represent your brand in advertising.\n")
    
    audience_description = input("Describe your target audience in detail: ")
    brand_description = input("Describe your brand/company in detail: ")
    
    # Analyze audience and brand
    generator.analyze_audience_and_brand(audience_description, brand_description)
    
    # Generate actor variations
    actors = generator.generate_actor_variations()
    
    # Select and refine actor
    final_actor = generator.select_and_refine_actor()
    
    if final_actor:
        print(f"\nFinal actor image saved to: {final_actor['local_path']}")
        
        # Provide advertising usage tips
        print("\n===== ADVERTISING USAGE TIPS =====")
        tips = generator.get_advertising_usage_tips()
        print(tips)
    else:
        print("\nActor generation process completed without a final selection.") 