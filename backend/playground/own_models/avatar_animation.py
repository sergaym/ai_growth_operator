import argparse
import asyncio
import os
import sys
import time
import json
import subprocess
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Hedra API key
HEDRA_API_KEY = os.getenv("HEDRA_API_KEY")

# Define Hedra API URLs
HEDRA_API_BASE_URL = "https://api.hedra.com"

# For checking if we have ffmpeg installed
def check_ffmpeg():
    """Check if ffmpeg is installed."""
    try:
        subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return True
    except Exception:
        return False

# Function to check if Hedra is installed
def check_hedra_installed():
    """
    This function now checks if we have the right ffmpeg installed
    instead of Hedra since we're using ffmpeg as a fallback.
    """
    try:
        import subprocess
        result = subprocess.run(
            ["ffmpeg", "-version"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode == 0:
            return True
        return False
    except Exception:
        return False

async def create_talking_avatar(
    image_path, 
    audio_path=None, 
    text=None,
    voice_id=None,
    output_dir="./output",
    filename=None,
    output_format="mp4",
    driver_options=None
):
    """Generate a talking avatar video by animating an image with audio."""
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None
    
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True, parents=True)
    
    # Generate filename if not provided
    if not filename:
        timestamp = int(time.time())
        image_name = Path(image_path).stem
        filename = f"avatar_{image_name}_{timestamp}.{output_format}"
    elif not filename.endswith(f".{output_format}"):
        filename = f"{filename}.{output_format}"
    
    filepath = output_path / filename
    
    # Check if we have an audio file
    if not audio_path or not os.path.exists(audio_path):
        if text:
            # Use text-to-speech to create an audio file
            print("Converting text to speech...")
            import sys
            sys.path.append(os.path.dirname(os.path.abspath(__file__)))
            from text_speech import generate_speech
            
            audio_path = await generate_speech(
                text=text,
                voice_id=voice_id,
                output_dir=output_dir
            )
            
            if not audio_path:
                print("Error: Failed to generate speech from text.")
                return None
        else:
            print("Error: Either audio_path or text must be provided")
            return None
    
    # Check if we have Hedra API key
    if HEDRA_API_KEY:
        print("Using Hedra API for high-quality facial animation")
        return await run_hedra_api(
            image_path=image_path,
            audio_path=audio_path,
            output_path=filepath,
            driver_options=driver_options
        )
    else:
        # Fallback to ffmpeg if no API key
        print("No Hedra API key found. Using ffmpeg for basic video creation (static image with audio)")
        return await run_ffmpeg_fallback(
            image_path=image_path,
            audio_path=audio_path,
            output_path=filepath,
            driver_options=driver_options
        )

async def run_hedra_api(image_path, audio_path, output_path, driver_options=None):
    """Use Hedra API to create talking avatar video."""
    try:
        print("Preparing to call Hedra API...")
        
        # Default options
        options = {
            "face_model": "mediapipe",      # Face detection model
            "motion_scale": 1.0,            # Scale of the motion
            "smooth_factor": 0.7,           # Temporal smoothing factor
            "quality": "high",              # Output quality: low, medium, high
            "enhance": True,                # Apply face enhancement
            "audio_offset": 0.0,            # Audio offset in seconds
        }
        
        # Update with user-provided options
        if driver_options and isinstance(driver_options, dict):
            options.update(driver_options)
        
        # Prepare headers
        headers = {
            "Authorization": f"Bearer {HEDRA_API_KEY}",
            "Accept": "application/json"
        }
        
        # First, upload the image file
        print("Uploading image to Hedra API...")
        with open(image_path, 'rb') as image_file:
            image_upload_url = f"{HEDRA_API_BASE_URL}/v1/uploads/image"
            files = {'file': (os.path.basename(image_path), image_file, 'image/png')}
            response = requests.post(image_upload_url, headers=headers, files=files)
            response.raise_for_status()
            image_data = response.json()
            image_id = image_data.get('id')
            if not image_id:
                print("Error: Failed to upload image")
                return None
            print(f"Image uploaded successfully with ID: {image_id}")
        
        # Next, upload the audio file
        print("Uploading audio to Hedra API...")
        with open(audio_path, 'rb') as audio_file:
            audio_upload_url = f"{HEDRA_API_BASE_URL}/v1/uploads/audio"
            files = {'file': (os.path.basename(audio_path), audio_file, 'audio/mpeg')}
            response = requests.post(audio_upload_url, headers=headers, files=files)
            response.raise_for_status()
            audio_data = response.json()
            audio_id = audio_data.get('id')
            if not audio_id:
                print("Error: Failed to upload audio")
                return None
            print(f"Audio uploaded successfully with ID: {audio_id}")
        
        # Create animation job
        print("Creating animation job...")
        create_url = f"{HEDRA_API_BASE_URL}/v1/animations"
        payload = {
            "image_id": image_id,
            "audio_id": audio_id,
            "face_model": options["face_model"],
            "motion_scale": options["motion_scale"],
            "smooth_factor": options["smooth_factor"],
            "quality": options["quality"],
            "enhance": options["enhance"],
            "audio_offset": options["audio_offset"]
        }
        
        response = requests.post(create_url, headers=headers, json=payload)
        response.raise_for_status()
        job_data = response.json()
        job_id = job_data.get('id')
        if not job_id:
            print("Error: Failed to create animation job")
            return None
        print(f"Animation job created with ID: {job_id}")
        
        # Poll for job completion
        print("Waiting for animation to complete...")
        max_attempts = 60  # 5 minutes with 5-second intervals
        for attempt in range(max_attempts):
            job_url = f"{HEDRA_API_BASE_URL}/v1/animations/{job_id}"
            response = requests.get(job_url, headers=headers)
            response.raise_for_status()
            job_status = response.json()
            
            status = job_status.get('status')
            print(f"Job status: {status}")
            
            if status == 'completed':
                result_url = job_status.get('result_url')
                if result_url:
                    # Download the result
                    print(f"Downloading result from {result_url}...")
                    response = requests.get(result_url, stream=True)
                    response.raise_for_status()
                    
                    with open(output_path, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    
                    print(f"Avatar video saved to: {output_path}")
                    return str(output_path)
                else:
                    print("Error: No result URL in completed job")
                    return None
            
            elif status == 'failed':
                error = job_status.get('error', 'Unknown error')
                print(f"Job failed: {error}")
                return None
            
            # Wait before next poll
            await asyncio.sleep(5)
        
        print("Error: Job timed out")
        return None
    
    except requests.exceptions.RequestException as e:
        print(f"API Error: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_detail = e.response.json()
                print(f"API Error Details: {json.dumps(error_detail, indent=2)}")
            except:
                print(f"API Error Status Code: {e.response.status_code}")
                print(f"API Error Text: {e.response.text}")
        
        # Fall back to ffmpeg if API fails
        print("Falling back to ffmpeg for basic video creation...")
        return await run_ffmpeg_fallback(image_path, audio_path, output_path, driver_options)
    
    except Exception as e:
        print(f"Error using Hedra API: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fall back to ffmpeg
        print("Falling back to ffmpeg for basic video creation...")
        return await run_ffmpeg_fallback(image_path, audio_path, output_path, driver_options)

async def run_ffmpeg_fallback(image_path, audio_path, output_path, driver_options=None):
    """Create a simple video using ffmpeg when API is not available."""
    try:
        print("Using ffmpeg for basic video creation...")
        
        # Default options
        options = {
            "duration": 5,        # Default duration if audio duration can't be determined
            "output_size": "512,512",  # Output resolution
            "fps": 30,           # Frames per second
            "quality": "high"     # Output quality: low, medium, high
        }
        
        # Update with user-provided options
        if driver_options and isinstance(driver_options, dict):
            options.update(driver_options)
        
        # Parse output size
        width, height = map(int, options["output_size"].split(","))
        
        # Get audio duration using ffprobe
        try:
            import subprocess
            cmd = [
                "ffprobe", 
                "-v", "error", 
                "-show_entries", "format=duration", 
                "-of", "default=noprint_wrappers=1:nokey=1", 
                audio_path
            ]
            result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode == 0:
                duration = float(result.stdout.strip())
                print(f"Audio duration: {duration} seconds")
                options["duration"] = duration
            else:
                print(f"Could not determine audio duration: {result.stderr}")
        except Exception as e:
            print(f"Error getting audio duration: {str(e)}")
            print(f"Using default duration: {options['duration']} seconds")
        
        # Set quality parameters
        if options["quality"] == "high":
            video_bitrate = "2M"
            audio_bitrate = "192k"
        elif options["quality"] == "medium":
            video_bitrate = "1M" 
            audio_bitrate = "128k"
        else:
            video_bitrate = "500k"
            audio_bitrate = "96k"
        
        # Build the ffmpeg command
        cmd = [
            "ffmpeg",
            "-loop", "1",
            "-i", image_path,
            "-i", audio_path,
            "-c:v", "libx264",
            "-tune", "stillimage",
            "-c:a", "aac",
            "-b:a", audio_bitrate,
            "-b:v", video_bitrate,
            "-vf", f"scale={width}:{height}:force_original_aspect_ratio=decrease,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2",
            "-shortest",
            "-movflags", "+faststart",
            "-pix_fmt", "yuv420p",
            "-y",
            str(output_path)
        ]
        
        # Run the command
        print(f"Running command: {' '.join(cmd)}")
        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        # Stream the output
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                print(output.strip())
        
        # Get return code
        return_code = process.poll()
        
        if return_code == 0 and os.path.exists(output_path):
            print(f"Avatar video saved to: {output_path}")
            return str(output_path)
        else:
            print(f"Error creating video. Return code: {return_code}")
            error = process.stderr.read()
            print(f"Error message: {error}")
            return None
    
    except Exception as e:
        print(f"Error creating video: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Generate talking avatar videos using Hedra API or ffmpeg")
    
    # Basic arguments
    parser.add_argument(
        "--image",
        required=True,
        help="Path to the avatar image file"
    )
    
    parser.add_argument(
        "--audio",
        help="Path to the audio file for lip-syncing"
    )
    
    parser.add_argument(
        "--text",
        help="Text for text-to-speech (alternative to audio file)"
    )
    
    parser.add_argument(
        "--voice-id",
        help="Voice ID for text-to-speech (when using --text)"
    )
    
    parser.add_argument(
        "--output-dir",
        default="./output",
        help="Directory to save generated video files"
    )
    
    parser.add_argument(
        "--filename",
        help="Filename for the output video file (default: auto-generated)"
    )
    
    # Hedra API and ffmpeg shared options
    parser.add_argument(
        "--output-size",
        default="512,512",
        help="Output resolution (width,height)"
    )
    
    parser.add_argument(
        "--quality",
        choices=["low", "medium", "high"],
        default="high",
        help="Output quality"
    )
    
    # Hedra API specific options
    parser.add_argument(
        "--face-model",
        choices=["mediapipe", "insightface"],
        default="mediapipe",
        help="Face model to use (Hedra API only)"
    )
    
    parser.add_argument(
        "--motion-scale",
        type=float,
        default=1.0,
        help="Scale of motion (0.0-2.0) (Hedra API only)"
    )
    
    parser.add_argument(
        "--smooth-factor",
        type=float,
        default=0.7,
        help="Temporal smoothing factor (0.0-1.0) (Hedra API only)"
    )
    
    parser.add_argument(
        "--enhance",
        action="store_true",
        default=True,
        help="Apply face enhancement (Hedra API only)"
    )
    
    parser.add_argument(
        "--audio-offset",
        type=float,
        default=0.0,
        help="Audio offset in seconds (Hedra API only)"
    )
    
    # ffmpeg specific options
    parser.add_argument(
        "--fps",
        type=int,
        default=30,
        help="Frames per second (ffmpeg fallback only)"
    )
    
    parser.add_argument(
        "--api-key",
        help="Hedra API key (overrides environment variable)"
    )
    
    return parser.parse_args()

async def main_async():
    """Async entry point."""
    args = parse_args()
    
    # Validate arguments
    if not args.audio and not args.text:
        print("Error: Either --audio or --text must be provided")
        return
    
    # Check for ffmpeg
    if not check_ffmpeg():
        print("Error: ffmpeg not found. Required for video processing. Please install it.")
        return
    
    # Use provided API key if specified
    global HEDRA_API_KEY
    if args.api_key:
        HEDRA_API_KEY = args.api_key
    
    # Build driver options from args
    driver_options = {
        # Common options
        "output_size": args.output_size,
        "quality": args.quality,
        
        # Hedra API specific options
        "face_model": args.face_model,
        "motion_scale": args.motion_scale,
        "smooth_factor": args.smooth_factor,
        "enhance": args.enhance,
        "audio_offset": args.audio_offset,
        
        # ffmpeg specific options
        "fps": args.fps
    }
    
    # Create the talking avatar video
    await create_talking_avatar(
        image_path=args.image,
        audio_path=args.audio,
        text=args.text,
        voice_id=args.voice_id,
        output_dir=args.output_dir,
        filename=args.filename,
        driver_options=driver_options
    )

if __name__ == "__main__":
    asyncio.run(main_async()) 