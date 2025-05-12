# API v1 Schemas

This directory contains schemas for version 1 of the AI Growth Operator API.

## Current Schemas

Version 1 of the API currently focuses on Text-to-Image generation:

- `text_to_image_schemas.py`: Schemas for generating images from text prompts
  - `AvatarParameters`: Parameters for avatar generation
  - `GenerateImageRequest`: Request model for general image generation
  - `GenerateAvatarRequest`: Request model for avatar generation
  - `UploadImageRequest`: Request model for uploading an image
  - `UploadImageResponse`: Response model for an uploaded image
  - `ImageGenerationResponse`: Response model for image generation

## Usage

When working with v1 endpoints, import schemas from this package:

```python
from app.api.v1.schemas import (
    GenerateImageRequest,
    ImageGenerationResponse,
    # other schemas...
)
```

## Adding New Schemas

When adding new schemas to v1:

1. Create a new file for the schema group (e.g., `image_editing_schemas.py`)
2. Define the schema classes
3. Export the schemas in the `__init__.py` file
4. Update documentation as needed 