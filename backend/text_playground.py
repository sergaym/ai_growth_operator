#!/usr/bin/env python
"""
Playground script for testing the AI Growth Operator marketing text generation capabilities.

This script demonstrates how to use OpenAI to generate marketing ideas and video prompts
based on the steps outlined in steps.md.

Usage:
    python text_playground.py

Note: Make sure you have set your OPENAI_API_KEY in the .env file
"""

import os
import sys
import json
from pprint import pprint

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import the text generation utilities
from utils.openai_utils import generate_marketing_idea, generate_video_prompt
from utils.prompt_utils import get_available_styles

def display_separator():
    """Display a separator line"""
    print("\n" + "=" * 80 + "\n")

def display_greeting():
    """Display a greeting message"""
    print("\n🚀 AI Growth Operator - Marketing Text Generation Playground")
    print("=" * 70)
    print("This playground allows you to generate marketing ideas using OpenAI.")
    print("Following the steps in steps.md:")
    print("1. Generate a marketing idea from an initial concept")
    print("2. Target a specific audience")
    print("3. Add reinforcement for the target audience")
    print("4. Optionally add references to images/videos")
    print("5. Generate a video prompt")
    print("=" * 70 + "\n")

def get_marketing_input():
    """Get user input for marketing idea generation"""
    print("📝 Marketing Idea Generation")
    print("-" * 30)
    
    initial_idea = input("Enter your initial product or service idea: ")
    target_audience = input("Describe your target audience: ")
    
    industry = input("Enter the industry (optional, press Enter to skip): ")
    industry = industry if industry.strip() else None
    
    tone = input("Desired tone for the campaign (optional, press Enter to skip): ")
    tone = tone if tone.strip() else None
    
    additional_context = input("Any additional context (optional, press Enter to skip): ")
    additional_context = additional_context if additional_context.strip() else None
    
    return {
        "initial_idea": initial_idea,
        "target_audience": target_audience,
        "industry": industry,
        "tone": tone,
        "additional_context": additional_context
    }

def get_video_prompt_input(marketing_idea):
    """Get user input for video prompt generation"""
    print("\n🎬 Video Prompt Generation")
    print("-" * 30)
    
    # Get style selection
    print("\nSelect a video style (or press Enter for none):")
    styles = get_available_styles()
    for i, style in enumerate(styles, 1):
        print(f"  {i}. {style}")
    
    style_choice = input("\nEnter style number (or press Enter for none): ")
    selected_style = None
    if style_choice.strip() and style_choice.isdigit():
        style_idx = int(style_choice) - 1
        if 0 <= style_idx < len(styles):
            selected_style = styles[style_idx]
    
    # Get video duration
    duration = input("\nEnter video duration (e.g., '30 seconds', default: 30 seconds): ")
    duration = duration if duration.strip() else "30 seconds"
    
    # Get references
    references = []
    add_references = input("\nAdd reference links? (y/n, default: n): ")
    if add_references.lower().startswith('y'):
        while True:
            reference = input("Enter a reference link or description (or press Enter to finish): ")
            if not reference.strip():
                break
            references.append(reference)
    
    return {
        "marketing_idea": marketing_idea,
        "visual_style": selected_style,
        "duration": duration,
        "references": references if references else None
    }

def process_marketing_idea(options):
    """Generate a marketing idea using the provided options"""
    try:
        print("\n🧠 Generating marketing idea...")
        
        result = generate_marketing_idea(
            initial_idea=options["initial_idea"],
            target_audience=options["target_audience"],
            industry=options["industry"],
            tone=options["tone"],
            additional_context=options["additional_context"]
        )
        
        print("\n✅ Marketing idea generated successfully!")
        print("\n📊 Results:")
        
        if result["headline"]:
            print(f"\n📌 Headline: {result['headline']}")
        
        if result["tagline"]:
            print(f"🔖 Tagline: {result['tagline']}")
        
        if result["value_proposition"]:
            print(f"\n💡 Value Proposition: {result['value_proposition']}")
        
        if result["key_messages"]:
            print("\n📣 Key Messages:")
            for i, msg in enumerate(result["key_messages"], 1):
                print(f"  {i}. {msg}")
        
        print("\n📝 Full Response:")
        print(result["full_response"])
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error generating marketing idea: {str(e)}")
        return None

def process_video_prompt(options):
    """Generate a video prompt using the provided options"""
    try:
        print("\n🎥 Generating video prompt...")
        
        result = generate_video_prompt(
            marketing_idea=options["marketing_idea"],
            visual_style=options["visual_style"],
            duration=options["duration"],
            references=options["references"]
        )
        
        print("\n✅ Video prompt generated successfully!")
        print("\n📝 Video Prompt:")
        print(result)
        
        return result
        
    except Exception as e:
        print(f"\n❌ Error generating video prompt: {str(e)}")
        return None

def save_results(marketing_idea, video_prompt):
    """Save the results to a file"""
    save_option = input("\nSave results to file? (y/n, default: n): ")
    if save_option.lower().startswith('y'):
        filename = input("Enter filename (default: marketing_results.json): ")
        filename = filename if filename.strip() else "marketing_results.json"
        
        # Create a dictionary with all results
        results = {
            "marketing_idea": marketing_idea,
            "video_prompt": video_prompt
        }
        
        # Save to file
        with open(filename, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"\n💾 Results saved to {filename}")

def main():
    """Main function to run the playground"""
    display_greeting()
    
    while True:
        display_separator()
        marketing_options = get_marketing_input()
        
        display_separator()
        marketing_idea = process_marketing_idea(marketing_options)
        
        if marketing_idea:
            video_options = get_video_prompt_input(marketing_idea)
            
            display_separator()
            video_prompt = process_video_prompt(video_options)
            
            if video_prompt:
                save_results(marketing_idea, video_prompt)
        
        display_separator()
        again = input("\nGenerate another marketing campaign? (y/n): ")
        if not again.lower().startswith('y'):
            break
    
    print("\n👋 Thank you for using the AI Growth Operator Marketing Text Generation Playground!")

if __name__ == "__main__":
    main() 