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
│   │           ├── marketing.py  # Marketing endpoints
│   │           ├── video.py      # Video endpoints
│   │           └── styles.py     # Styles endpoints
│   ├── core/               # Core configuration
│   │   ├── config.py       # Application settings
│   │   └── __init__.py     # Package initialization
│   ├── models/             # Data models and schemas
│   │   └── schemas.py      # Pydantic models for request/response
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
  - `/api/v1/marketing/idea` - Generate marketing ideas (v1)
  - `/api/marketing/idea` - Legacy endpoint (for backward compatibility)

The versioning structure makes it easy to add new API versions (v2, v3) while maintaining backward compatibility. When implementing breaking changes, create a new version folder under `app/api/` with its own endpoints.

## Future Enhancements

- Support for image-to-video generation
- Integration with ad platform APIs
- Audience targeting capabilities
- Performance monitoring and analytics
- Automatic campaign optimization

## License

MIT License - See LICENSE file for details.
