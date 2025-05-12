# API Version 1 (v1)

This directory contains the current generation components of the AI Growth Operator API.

## Structure

- `endpoints/`: API endpoint route handlers
- `schemas/`: Pydantic models for request/response validation and documentation
- `services/`: Service layer for external API integrations and business logic

## Current Focus

Version 1 of the API now focuses on our new Text-to-Image generation capabilities:

- `/text-to-image`: Endpoints for generating images from text prompts
  - `/text-to-image/generate`: Generate images from text prompts
  - `/text-to-image/avatar`: Generate avatar images with specific characteristics
  - `/text-to-image/upload`: Upload images to the fal.ai platform

Legacy endpoints have been moved to the v0 API for better organization and to provide a cleaner development path forward.

## Versioning Approach

We've organized our API code to follow a clear versioning structure:

1. Each version has its own isolated set of endpoints, schemas, and services
2. Legacy endpoints are maintained in v0
3. New features are developed in v1 (or newer versions)

This structure enables:

- Clean separation between versions
- Better organization of related features
- Easier maintenance and evolution of the API
- Clear documentation of API changes

## Development Guidelines

When adding new features to v1:

1. Create or update the schemas in `app/api/v1/schemas/`
2. Create or update the services in `app/api/v1/services/`
3. Add the endpoint handlers in `app/api/v1/endpoints/`
4. Register the endpoint router in `app/api/v1/api.py`

## Backward Compatibility

To maintain backward compatibility during the transition to this versioned structure, the root-level `app/schemas/__init__.py` and `app/services/__init__.py` files re-export the v1 components. This allows existing code to continue working without modification.

For new development, directly import from the versioned packages:

```python
# Import schemas from v1
from app.api.v1.schemas import GenerateImageRequest

# Import services from v1
from app.api.v1.services import text_image_service
``` 