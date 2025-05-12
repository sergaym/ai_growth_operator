# API v1 Services

This directory contains services for version 1 of the AI Growth Operator API.

## Current Services

Version 1 of the API currently focuses on Text-to-Image generation:

- `text_to_image_service.py`: Service for generating images from text prompts
  - `TextToImageService`: Class for interacting with the fal.ai API
  - `text_to_image_service`: Singleton instance of the TextToImageService class

## Usage

When working with v1 endpoints, import services from this package:

```python
from app.api.v1.services import text_to_image_service
```

## Adding New Services

When adding new services to v1:

1. Create a new file for the service (e.g., `image_editing_service.py`)
2. Define the service class and/or functions
3. Export the service in the `__init__.py` file
4. Update documentation as needed

## Service Design Principles

When designing new services:

1. Use dependency injection where possible
2. Create singleton instances for stateful services
3. Use async/await for I/O-bound operations
4. Handle errors gracefully and provide meaningful error messages
5. Document all public methods and functions 