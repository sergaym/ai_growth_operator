# API Structure and Versioning Guidelines

## Overview

The AI Growth Operator API follows a versioned API structure to ensure backward compatibility while allowing for evolution of the API.

## Directory Structure

```
app/
├── api/
│   ├── v0/                # Legacy API (backward compatibility)
│   │   ├── endpoints/     # Legacy route handlers
│   │   └── api.py         # Legacy router aggregation
│   ├── v1/                # Current API version
│   │   ├── endpoints/     # Route handlers for v1
│   │   ├── schemas/       # Pydantic models for v1
│   │   ├── services/      # Business logic & external integrations for v1
│   │   └── api.py         # Router aggregation for v1
│   └── __init__.py        # Exports the combined API router
├── core/                  # Core application components
├── db/                    # Database models and connections
└── main.py                # Application entry point
```

## API Version Organization

We've organized our API into distinct versions:

- **v0**: Contains legacy endpoints (idea generation, marketing, video generation, styles)
- **v1**: Contains current generation endpoints (text-to-image generation)

## Versioning Principles

1. **Isolated Versioning**: Each API version has its own isolated set of:
   - Endpoints
   - Schemas
   - Services

2. **Backward Compatibility**:
   - Legacy endpoints are maintained in v0
   - v0 endpoints are also available at the root level (without /v0 prefix) for backward compatibility
   - New features are developed in v1 (or newer versions)
   - When breaking changes are needed, create a new version

3. **Code Organization**:
   - All code specific to a version should live in that version's directory
   - Shared utilities should go in appropriate shared locations (core, utils, etc.)

## Adding New Features

### To an Existing Version

1. Create or update the schemas in `app/api/vX/schemas/`
2. Create or update the services in `app/api/vX/services/`
3. Add the endpoint handlers in `app/api/vX/endpoints/`
4. Register the endpoint router in `app/api/vX/api.py`

### Creating a New API Version

1. Copy the latest version's directory structure (e.g., `cp -r app/api/v1 app/api/v2`)
2. Update imports in the new version to refer to the new version's modules
3. Make your changes to the new version
4. Create an `api.py` file in the new version directory
5. Update `app/api/__init__.py` to include the new version's router

## Migration Strategy

When creating a new API version:

1. Keep the old version fully functional
2. Add deprecation notices to endpoints that will be removed in future versions
3. Document migration paths for API consumers
4. Encourage users to adopt the new version through documentation and communication 