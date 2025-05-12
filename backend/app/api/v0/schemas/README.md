# API v0 Schemas (Legacy)

This directory contains re-exports of legacy schemas from the main schemas package for backward compatibility.

## Purpose

The v0 schemas package serves as a container for legacy schema definitions that are maintained for backward compatibility. These schemas are used by the v0 API endpoints.

## Usage

When working with v0 endpoints, import schemas from this package:

```python
from app.api.v0.schemas import (
    IdeaRequest,
    IdeaResponse,
    # other schemas...
)
```

## Schema Categories

The following schema categories are available in v0:

- **Idea Generation**: Schemas for idea generation endpoints
- **Marketing**: Schemas for marketing idea generation endpoints
- **Styles**: Schemas for style listing endpoints
- **Video**: Schemas for video generation endpoints

## Maintenance Policy

The v0 schemas are considered frozen and should only receive critical bug fixes. New schemas should be developed in v1 or newer versions. 