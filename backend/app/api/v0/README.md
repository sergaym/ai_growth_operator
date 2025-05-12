# API Version 0 (v0)

This directory contains the legacy components of the AI Growth Operator API that were previously part of v1.

## Purpose

The v0 API serves as a container for legacy endpoints that are maintained for backward compatibility. As we evolve the API, we're organizing endpoints more logically:

- **v0**: Legacy endpoints (idea generation, marketing, video generation, styles)
- **v1**: Current generation endpoints (text-to-image generation)

## Endpoints

The following endpoints are available in v0:

- `/idea`: Idea generation endpoints
- `/marketing`: Marketing idea generation endpoints (redirects to idea endpoints)
- `/styles`: Style listing endpoints
- `/video/luma`: Luma video generation endpoints
- `/video/heygen`: HeyGen video generation endpoints

## Backward Compatibility

For backward compatibility, these endpoints are also available at the root level (without the `/v0` prefix). This ensures that existing client integrations continue to work without modification.

## Future Development

New features should be developed in v1 or newer versions. The v0 API is considered frozen and should only receive critical bug fixes. 