# 🚀 AI Growth Operator

[![Status](https://img.shields.io/badge/Status-Development-yellow)](https://github.com/username/ai-ugc)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)

> An intelligent agent that runs and optimizes user acquisition campaigns end-to-end, learning and adapting without manual intervention.

## 📋 Overview

The **AI Growth Operator** is a sophisticated AI agent that automates and optimizes the entire digital marketing workflow:

1. **Ideation**: Takes an initial idea or value proposition as input
2. **Content Creation**: Automatically generates ad creatives (texts, images, videos)
3. **Campaign Launch**: 
   - Connects to major ad platforms (Meta, Google, TikTok, etc.)
   - Defines target audiences based on analytics
   - Deploys campaigns with optimal parameters

4. **Continuous Optimization**:
   - Monitors performance metrics in real-time
   - Creates new content when engagement declines
   - Dynamically adjusts audience segments based on performance data
   - Automatically optimizes budget allocation for maximum ROI

## 🔍 Key Features

- **End-to-End Automation**: From concept to optimization with minimal human intervention
- **Multi-Platform Integration**: Seamless connection with all major advertising platforms
- **Adaptive Learning**: Continuously improves based on campaign performance
- **Dynamic Content Generation**: Creates new ad variants based on performance data

## 🚀 Getting Started

*Coming soon...*

## 🔗 Related Resources

*Coming soon...*

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

# AI Growth Operator - Backend API

This module provides the backend API implementation for the "AI Growth Operator" platform, including the marketing campaign ideation and video generation capabilities.

## Features

- Generate marketing campaign ideas based on initial concepts
- Create video generation prompts from marketing ideas
- Support for different video styles and camera motions
- Multi-language adaptation with cultural context awareness
- End-to-end idea-to-video content generation pipeline
- RESTful API with proper documentation
- Docker containerization for easy deployment

## Technology Stack

- **Python**: Core programming language
- **FastAPI**: Modern, high-performance web framework
- **OpenAI API**: Used for text generation
- **Luma AI API**: Used for video generation
- **Pydantic**: Data validation and settings management
- **Uvicorn**: ASGI server
- **Docker**: Containerization

## Project Structure

```
backend/
├── app/                    # Main application package
│   ├── api/                # API package with versioning
│   │   ├── __init__.py     # Main API router
│   │   └── v1/             # API version 1
│   │       ├── api.py      # Version 1 router
│   │       ├── __init__.py # V1 package init
│   │       └── endpoints/  # V1 endpoints
│   │           ├── idea.py       # Idea generation endpoints
│   │           ├── marketing.py  # Legacy marketing endpoints (for backward compatibility)
│   │           ├── video.py      # Video endpoints
│   │           └── styles.py     # Styles endpoints
│   │               ├── idea.py       # Idea generation endpoints
│   │               ├── marketing.py  # Legacy marketing endpoints (for backward compatibility)
│   │               ├── video.py      # Video endpoints
│   │               └── styles.py     # Styles endpoints
│   ├── core/               # Core configuration
│   │   ├── config.py       # Application settings
│   │   └── __init__.py     # Package initialization
│   ├── models/             # Data models
│   ├── schemas/            # Pydantic request/response schemas 
│   │   ├── __init__.py     # Schema re-exports
│   │   ├── marketing_schemas.py  # Marketing-related schemas
│   │   ├── video_schemas.py      # Video-related schemas
│   │   └── styles_schemas.py     # Styles-related schemas
│   ├── services/           # External service integrations
│   │   ├── openai_service.py   # OpenAI API integration
│   │   ├── luma_service.py     # Luma AI video generation
│   │   └── prompt_service.py   # Prompt enhancement utilities
│   └── main.py             # Application initialization
├── utils/                  # General utility functions
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker configuration
├── entrypoint.sh           # Docker entrypoint script
└── run.py                  # Development server runner
```

## Getting Started

### Prerequisites

- Python 3.8+
- OpenAI API key
- Luma AI API key (optional, for video generation)

### Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-ugc
   ```

2. Set up the Python virtual environment:
   ```
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure your API keys:
   - Create a `.env` file in the backend directory
   - Add your API keys:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     LUMAAI_API_KEY=your_lumaai_api_key_here
     ```

### Running the API (Development)

Run the development server:

```
python run.py
```

The API will be available at http://localhost:8000

### Running with Docker

Build and run the Docker container:

```
# Build the container
docker build -t ai-growth-operator-api .

# Run the container
docker run -p 80:80 -e OPENAI_API_KEY=your_key_here -e LUMAAI_API_KEY=your_key_here ai-growth-operator-api
```

The API will be available at http://localhost:80

### API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs (development) or http://localhost/docs (Docker)
- ReDoc: http://localhost:8000/redoc (development) or http://localhost/redoc (Docker)

### API Versioning

The API follows a strict versioning scheme to ensure backward compatibility:

- Base endpoint: `/api`
- Versioned endpoints: `/api/v1/...` 
- Example endpoints:
  - `/api/v1/idea/generate` - Generate creative ideas (v1)
  - `/api/v1/idea/refine` - Refine ideas (v1) 
  - `/api/v1/idea/adapt-language` - Adapt ideas to different languages and cultural styles (v1)
  - `/api/v1/video/prompt` - Generate video prompts (v1)
  - `/api/v1/video/generate-from-idea` - Generate videos directly from ideas (v1)
  - `/api/v1/video/status/{generation_id}` - Check video generation status (v1)
  - `/api/v1/marketing/idea` - Legacy endpoint (for backward compatibility)

The versioning structure makes it easy to add new API versions (v2, v3) while maintaining backward compatibility. When implementing breaking changes, create a new version folder under `app/api/` with its own endpoints.

## Video Generation

The platform offers end-to-end video content generation capabilities:

### Idea-to-Video Pipeline

Generate compelling marketing videos directly from your creative ideas with a single API call. The platform handles:

1. Converting your idea to a detailed video script
2. Setting up visual styles, shots, and scene transitions
3. Generating the video content asynchronously
4. Providing status updates during generation
5. Delivering the completed video

```json
// Request to generate a video from an idea
{
  "idea": {
    // The idea object from idea generation
    "headline": "Escape to Purity",
    "tagline": "Nature's refreshment, bottled for you",
    "value_proposition": "Our spring water comes from pristine mountain sources, untouched by pollution",
    "key_messages": [...]
  },
  "video_settings": {
    "visual_style": "cinematic",
    "duration": "45 seconds",
    "aspect_ratio": "16:9",
    "music_type": "uplifting orchestral",
    "include_text_overlays": true
  }
}
```

### Reference-Based Video Generation

The platform also supports using specific images and videos as references to guide the video generation:

```json
// Request to generate a video using reference media
{
  "prompt": "A sleek fitness tracker helping busy professionals stay fit throughout their day",
  "media_references": [
    {
      "url": "https://example.com/images/fitness_tracker_closeup.jpg",
      "type": "image",
      "weight": 1.2,
      "description": "Reference for the product appearance and display"
    },
    {
      "url": "https://example.com/videos/fitness_routine.mp4",
      "type": "video",
      "weight": 0.8,
      "description": "Reference for the exercise sequences"
    }
  ],
  "settings": {
    "visual_style": "premium",
    "duration": "30 seconds",
    "aspect_ratio": "16:9",
    "music_type": "motivational",
    "include_text_overlays": true
  }
}
```

The `media_references` parameter allows you to provide:
- Images that guide visual style, composition, or specific elements
- Video clips that influence motion, pacing, or transitions
- Custom weight values to control how much each reference influences the final result
- Descriptions to clarify how each reference should be used

This enables more precise control over the generated video's appearance and feel, especially useful for maintaining brand consistency or matching the style of previous campaigns.

### Asynchronous Processing

Video generation is handled asynchronously:

1. Submit a generation request to `/api/v1/video/generate-from-idea` or `/api/v1/video/generate-with-references`
2. Receive an immediate response with a `generation_id`
3. Poll the status using `/api/v1/video/status/{generation_id}`
4. Retrieve the completed video URL when generation is complete

### Multi-language Support

The video generation system automatically detects when working with multilingual ideas:

- For ideas that have been adapted to another language, the system uses the original English idea for prompt generation
- The resulting videos can be branded with text overlays in the target language
- This ensures that the video generation works optimally while preserving the localized messaging

## Language Adaptation

The platform supports adapting content to different languages and cultural contexts:

- Contextual adaptation rather than direct translation
- Support for language-specific cultural styles (e.g., "Spanish with Mexican style")
- Preservation of brand keywords in original language
- Cultural notes to explain adaptation decisions
- Tone adjustments specific to target cultures

This allows for truly localized content that resonates with regional audiences while maintaining brand consistency.

### Integrated Workflow

Language adaptation is seamlessly integrated into the core idea generation and refinement workflows:

```json
// Request to generate an idea in Spanish with Mexican cultural style
{
  "initial_idea": "A refreshing beverage for hot summer days",
  "target_audience": "Young adults 18-25 who enjoy outdoor activities",
  "tone": "Energetic and fun",
  "language_settings": {
    "target_language": "Spanish",
    "cultural_style": "Mexican",
    "preserve_keywords": ["Brand X"],
    "tone_adjustment": "More vibrant and colorful language"
  }
}
```

The response includes both the adapted content and the original English version:

```json
{
  "headline": "¡Refresca tu verano con sabor mexicano!",
  "tagline": "La bebida de Brand X para tus aventuras bajo el sol",
  "value_proposition": "Una explosión de sabor que te da la energía para seguir disfrutando",
  "key_messages": [...],
  "language": "Spanish",
  "cultural_style": "Mexican",
  "cultural_notes": "Adapted with references to Mexican outdoor culture and traditional refreshment concepts...",
  "original_idea": {
    // Original English content
  }
}
```

This integrated approach allows for a one-step process from idea to localized content.

## Future Enhancements

- Support for image-to-video generation
- Integration with ad platform APIs
- Audience targeting capabilities
- Performance monitoring and analytics
- Automatic campaign optimization

## License

MIT License - See LICENSE file for details.
