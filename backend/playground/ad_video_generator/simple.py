import os
import argparse
import requests
import time
import re
from dotenv import load_dotenv
from typing import Dict, Any, Optional, List

# Load environment variables
load_dotenv()

class SimpleVideoGenerator:
    """Simple video generator using HeyGen API to create Spanish UGC-style videos."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize with HeyGen API key."""
        self.api_key = api_key or os.environ.get("HEYGEN_API_KEY")
        if not self.api_key:
            raise ValueError("HeyGen API key is required. Set HEYGEN_API_KEY environment variable or pass it directly.")
        
        self.base_url = "https://api.heygen.com"
        self.headers = {
            "x-api-key": self.api_key,  # lowercase is used in the Postman examples
            "Content-Type": "application/json", 
            "accept": "application/json"
        }
        self.output_dir = os.path.join("backend", "playground", "ad_video_generator", "output")
        os.makedirs(self.output_dir, exist_ok=True)
        
        # Average speaking rate (words per minute)
        self.avg_speaking_rate = 150
    
    def get_avatar_pose_id(self, gender: str = "female") -> str:
        """Get an appropriate avatar pose ID based on gender."""
        # Use exact avatar IDs from Postman collection example
        default_poses = {
            "female": "Vanessa-invest-20220722",  # From Postman collection example 
            "male": "Daniel-neutral-20220123"     # Placeholder
        }
        return default_poses.get(gender.lower(), default_poses["female"])
    
    def get_voice_id(self, gender: str = "female") -> str:
        """Get a Spanish voice ID based on gender."""
        # Using known working voice IDs directly from Postman collection
        default_voices = {
            "female": "1bd001e7e50f421d891986aad5158bc8",  # From Postman collection
            "male": "2f72ee82b83d4b00af16c4771d611752"     # Another sample voice ID
        }
        return default_voices.get(gender.lower(), default_voices["female"])
    
    def estimate_word_count(self, text: str) -> int:
        """Estimate the number of words in a text."""
        # Split by whitespace and count non-empty strings
        return len([w for w in re.split(r'\s+', text) if w])
    
    def adjust_text_for_duration(self, text: str, target_duration_seconds: int) -> str:
        """
        Adjust the input text to match the target duration.
        This is a simple estimation based on average speaking rate.
        """
        if target_duration_seconds <= 0:
            return text
            
        # Calculate target word count
        target_word_count = int((target_duration_seconds / 60) * self.avg_speaking_rate)
        current_word_count = self.estimate_word_count(text)
        
        if current_word_count == 0:
            return text
            
        if current_word_count < target_word_count:
            print(f"Warning: Provided text is too short for {target_duration_seconds} seconds (estimated {current_word_count} words, need ~{target_word_count}).")
            print("The video will be shorter than requested unless you provide more text.")
            return text
            
        if current_word_count > target_word_count:
            print(f"Warning: Provided text is too long for {target_duration_seconds} seconds (estimated {current_word_count} words, need ~{target_word_count}).")
            print("The text will be truncated to approximately match the requested duration.")
            
            # Simple approach: split into words and take the first target_word_count words
            words = re.split(r'(\s+)', text)
            content_words = [w for w in words if not re.match(r'\s+', w)]
            
            if len(content_words) <= target_word_count:
                return text
                
            # Reconstruct the text with the desired number of words
            result = ''
            word_count = 0
            for word in words:
                if not re.match(r'\s+', word):
                    word_count += 1
                    if word_count > target_word_count:
                        break
                result += word
                
            return result
        
        return text
    
    def create_video(self, script: str, gender: str = "female", target_duration_seconds: int = 0) -> Dict[str, Any]:
        """
        Create a video with the given script using an avatar and voice.
        
        Args:
            script: The text for the avatar to speak
            gender: Preferred gender for avatar and voice (female/male)
            target_duration_seconds: Target duration in seconds (0 means no adjustment)
            
        Returns:
            Dict containing video information
        """
        # Adjust script length if a target duration is specified
        if target_duration_seconds > 0:
            print(f"Adjusting script for target duration of {target_duration_seconds} seconds...")
            original_word_count = self.estimate_word_count(script)
            script = self.adjust_text_for_duration(script, target_duration_seconds)
            new_word_count = self.estimate_word_count(script)
            print(f"Adjusted from {original_word_count} to {new_word_count} words.")
        
        # Get appropriate avatar and voice
        avatar_pose_id = self.get_avatar_pose_id(gender)
        voice_id = self.get_voice_id(gender)
        
        print(f"Using avatar pose ID: {avatar_pose_id}")
        print(f"Using voice ID: {voice_id}")
        
        # Format payload exactly as shown in the Postman collection example
        payload = {
            "avatar_pose_id": avatar_pose_id,
            "avatar_style": "normal",
            "input_text": script,
            "voice_id": voice_id
        }
        
        try:
            # Generate video using the v1/video.webm endpoint
            print("Generating video...")
            response = requests.post(
                f"{self.base_url}/v1/video.webm", 
                headers=self.headers, 
                json=payload
            )
            
            # Print debug info
            print(f"Status code: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Continue only if we got a valid response
            response.raise_for_status()
            data = response.json()
            
            # Check response for video_id
            if data.get("code") == 100 and "data" in data and "video_id" in data["data"]:
                video_id = data["data"]["video_id"]
                print(f"Video generation started. Video ID: {video_id}")
                return self._poll_for_completion(video_id)
            else:
                error_msg = data.get("message", "Unknown error")
                return {
                    "status": "error",
                    "error": f"API error: {error_msg}",
                    "response": data
                }
                
        except Exception as e:
            print(f"Error creating video: {e}")
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _poll_for_completion(self, video_id: str, max_tries: int = 60, interval: int = 5) -> Dict[str, Any]:
        """Poll for video completion using video_status.get endpoint."""
        print(f"Waiting for video to complete processing...")
        
        for attempt in range(max_tries):
            try:
                response = requests.get(
                    f"{self.base_url}/v1/video_status.get?video_id={video_id}", 
                    headers=self.headers
                )
                response.raise_for_status()
                data = response.json()
                
                # Check for code 100 which indicates success
                if data.get("code") == 100:
                    status = data.get("data", {}).get("status")
                    print(f"Video status: {status}")
                    
                    if status == "completed":
                        video_url = data.get("data", {}).get("video_url")
                        thumbnail_url = data.get("data", {}).get("thumbnail_url")
                        duration = data.get("data", {}).get("duration", 0)
                        print(f"Video ready: {video_url}")
                        print(f"Video duration: {duration} seconds")
                        video_path = self._download_video(video_url)
                        return {
                            "status": "success",
                            "video_id": video_id,
                            "video_url": video_url,
                            "thumbnail_url": thumbnail_url,
                            "duration": duration,
                            "local_path": video_path
                        }
                    elif status == "failed":
                        error = data.get("data", {}).get("error", {})
                        error_msg = error.get("message", "Unknown error")
                        return {
                            "status": "error",
                            "error": f"Video generation failed: {error_msg}"
                        }
                    elif status in ["pending", "processing"]:
                        print(f"Still processing... (attempt {attempt+1}/{max_tries})")
                        time.sleep(interval)
                    else:
                        print(f"Unknown status: {status}")
                        time.sleep(interval)
                else:
                    error_msg = data.get("message", "Unknown error")
                    print(f"API error: {error_msg}")
                    time.sleep(interval)
                
            except Exception as e:
                print(f"Error polling video status: {e}")
                time.sleep(interval)
        
        return {
            "status": "timeout",
            "error": f"Video generation did not complete within timeout period ({max_tries * interval} seconds)"
        }
    
    def _download_video(self, url: str) -> Optional[str]:
        """Download video to output directory."""
        try:
            timestamp = int(time.time())
            filename = f"video_{timestamp}.mp4"
            filepath = os.path.join(self.output_dir, filename)
            
            print(f"Downloading video to {filepath}")
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"Video downloaded successfully")
            return filepath
        except Exception as e:
            print(f"Error downloading video: {e}")
            return None

def main():
    """Command line interface for the video generator."""
    parser = argparse.ArgumentParser(description="Generate a video with avatar and voice from a script")
    
    parser.add_argument("--script", type=str, help="Script text or path to script file (.txt)")
    parser.add_argument("--gender", type=str, choices=["female", "male"], default="female", 
                        help="Preferred gender for avatar and voice (default: female)")
    parser.add_argument("--api-key", type=str, help="HeyGen API key (optional, uses env var if not provided)")
    parser.add_argument("--duration", type=int, default=0, 
                        help="Target video duration in seconds (default: 0, meaning no adjustment)")
    
    args = parser.parse_args()
    
    # Get script text (either directly or from file)
    script_text = args.script
    if args.script and args.script.endswith(".txt") and os.path.exists(args.script):
        with open(args.script, "r", encoding="utf-8") as f:
            script_text = f.read()
    
    # If no script provided, use default example
    if not script_text:
        # This script has approximately 150 words - should be about 1 minute
        script_text = """¿Tus redes sociales te quitan tiempo para hacer crecer tu negocio?

Yo pasé por lo mismo… hasta que decidí delegarlo con el KIT DIGITAL.
Ahora tengo más foco, más tiempo… y encima ¡me salió GRATIS!

Se encargan de TODO como si fuera su propia marca.
Me mantienen al tanto sin agobiarme.
Y además, incluye GRATIS:

Página web profesional
SEO para salir en Google
Factura electrónica
¡y Hasta un portátil!

El único error fue no pedirlo antes.
Los fondos limitados así que regístrate aquí antes de que se acabe.

Si estás buscando mejorar tu presencia digital, esta es la oportunidad perfecta.
No pierdas más tiempo intentando gestionar todo por tu cuenta.
Con el KIT DIGITAL, puedes centrarte en lo que realmente importa: hacer crecer tu negocio.

Los resultados hablan por sí mismos. Desde que empecé a utilizar estos servicios, mi productividad ha aumentado considerablemente.
Ya no tengo que preocuparme por actualizar mis redes sociales o mi página web.
Todo se gestiona de manera profesional, permitiéndome concentrar mis energías en mi verdadera pasión."""
    
    # Generate the video
    generator = SimpleVideoGenerator(api_key=args.api_key)
    result = generator.create_video(script_text, gender=args.gender, target_duration_seconds=args.duration)
    
    # Print result summary
    if result["status"] == "success":
        print("\n===== SUCCESS =====")
        print(f"Video generated successfully!")
        print(f"Video ID: {result.get('video_id', 'Unknown')}")
        print(f"Duration: {result.get('duration', 'Unknown')} seconds")
        print(f"Online URL: {result['video_url']}")
        print(f"Local file: {result['local_path']}")
    else:
        print("\n===== FAILED =====")
        print(f"Failed to generate video: {result.get('error', 'Unknown error')}")
    
    return result

if __name__ == "__main__":
    main()