# API v1 Endpoints

This directory contains the endpoints for version 1 of the AI Growth Operator API.

## Current Endpoints

Version 1 of the API currently focuses on Text-to-Image generation:

- `text_to_image.py`: Endpoints for generating images from text prompts
  - `POST /text-to-image/generate`: Generate images from text prompts
  - `POST /text-to-image/avatar`: Generate avatar images with specific characteristics
  - `POST /text-to-image/upload`: Upload images to the fal.ai platform

## Legacy Endpoints

Legacy endpoints have been moved to the v0 API:
- Idea generation
- Marketing
- Video generation
- Styles

These can be found in the `app/api/v0/endpoints` directory.

## Adding New Endpoints

When adding new endpoints to v1:

1. Create a new file for the endpoint group (e.g., `image_editing.py`)
2. Define the router and endpoint handlers
3. Register the router in `app/api/v1/api.py`
4. Update documentation as needed 