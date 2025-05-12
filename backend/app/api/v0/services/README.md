# API v0 Services (Legacy)

This directory contains re-exports of legacy services from the main services package for backward compatibility.

## Purpose

The v0 services package serves as a container for legacy service functions and classes that are maintained for backward compatibility. These services are used by the v0 API endpoints.

## Usage

When working with v0 endpoints, import services from this package:

```python
from app.api.v0.services import (
    generate_idea,
    refine_idea,
    # other services...
)
```

## Service Categories

The following service categories are available in v0:

- **OpenAI**: Services for idea generation and language adaptation
- **Prompt**: Services for style listing
- **Luma**: Services for Luma video generation
- **HeyGen**: Services for HeyGen video generation

## Maintenance Policy

The v0 services are considered frozen and should only receive critical bug fixes. New services should be developed in v1 or newer versions. 