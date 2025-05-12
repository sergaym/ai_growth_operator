# Services Package

This directory contains service integrations with external APIs for the AI Growth Operator.

## Versioned Services

We've organized our services into versioned packages:

- **v0**: Legacy services (idea generation, marketing, video generation, styles)
- **v1**: Current generation services (text-to-image generation)

## Root-Level Re-exports

For backward compatibility, this package re-exports:

1. All v1 services (text-to-image)
2. All v0 services (legacy)

## Usage Guidelines

For new development:

- **For v1 features**: Import directly from the versioned package
  ```python
  from app.api.v1.services import text_to_image_service
  ```

- **For legacy features**: Import from the v0 package
  ```python
  from app.api.v0.services import generate_idea, refine_idea
  ```

- **For backward compatibility**: Import from this package
  ```python
  from app.services import text_to_image_service, generate_idea
  ```

## Implementation Note

This package contains no actual service implementations. All service code has been moved to the appropriate versioned packages:

- Legacy services (v0): `app/api/v0/services/`
- Current services (v1): `app/api/v1/services/`

## Future Development

New services should be developed in the appropriate versioned package (e.g., `app/api/v1/services/`) rather than in this root directory. 