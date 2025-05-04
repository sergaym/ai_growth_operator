# Simple Video Generator

A Python tool for creating videos with avatars and Spanish voiceover using the HeyGen API.

## Features

- **Easy-to-use API**: Create avatar videos with just a script and gender preference
- **Spanish Voice Support**: Automatically selects Spanish voices for natural delivery
- **TikTok-Optimized Format**: Creates portrait-mode videos ideal for TikTok and social media
- **HeyGen V2 API Integration**: Uses the latest HeyGen API for high-quality avatar videos

## Requirements

- Python 3.7+
- HeyGen API key (set as environment variable `HEYGEN_API_KEY` or pass directly)
- Required Python packages:
  - `requests`
  - `python-dotenv`

## Installation

1. Clone this repository
2. Install required packages:
   ```
   pip install requests python-dotenv
   ```
3. Set your HeyGen API key in a `.env` file:
   ```
   HEYGEN_API_KEY=your_api_key_here
   ```

## Usage

### Command Line Interface

The simplest way to use the generator is via the command line:

```bash
python -m backend.playground.ad_video_generator.simple --script "Your script here" --gender female
```

Or using a script file:

```bash
python -m backend.playground.ad_video_generator.simple --script path/to/script.txt --gender male
```

### Python API

```python
from backend.playground.ad_video_generator import SimpleVideoGenerator

# Initialize the generator
generator = SimpleVideoGenerator()

# Define your script
script = """¿Tus redes sociales te quitan tiempo para hacer crecer tu negocio?

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

Los fondos limitados así que regístrate aquí antes de que se acabe."""

# Generate the video (female avatar/voice is the default)
result = generator.create_video(script, gender="female")

# Access the resulting video path
if result["status"] == "success":
    video_path = result["local_path"]
    video_url = result["video_url"]
    print(f"Video generated at: {video_path}")
    print(f"Online URL: {video_url}")
```

## How It Works

The generator performs these simple steps:

1. Connects to HeyGen using your API key
2. Selects an appropriate avatar based on gender preference
3. Finds a Spanish voice that matches the gender preference
4. Submits the entire script for video generation
5. Polls for completion if necessary (asynchronous API)
6. Downloads the completed video to local storage

## Output

The generator creates:

1. An MP4 video file in the `output` directory
2. A result object with status, video URL, and local file path

## Example

Using the default example script about "KIT DIGITAL", the generator:

1. Creates a portrait-mode video using a Spanish-speaking avatar
2. Delivers the entire script as a single continuous video
3. Returns the URL and downloads a local copy

## Customization

You can customize the generator by:

- Providing your own HeyGen API key for access to your custom avatars
- Specifying gender preference for the avatar and voice
- Modifying the background color and video format in the code

## Troubleshooting

If you encounter issues:

1. Verify your HeyGen API key is valid and has sufficient credits
2. Check that you have an internet connection
3. Make sure the required Python packages are installed 