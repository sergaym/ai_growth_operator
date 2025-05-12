# API v0 Endpoints (Legacy)

This directory contains the legacy endpoints for the AI Growth Operator API, maintained for backward compatibility.

## Legacy Endpoints

The following legacy endpoints are available in v0:

- `idea.py`: Idea generation endpoints
  - `POST /idea/generate`: Generate creative ideas
  - `POST /idea/refine`: Refine existing ideas
  - `POST /idea/adapt-language`: Adapt ideas to different languages

- `marketing.py`: Marketing idea generation endpoints
  - `POST /marketing/idea`: Generate marketing campaign ideas (redirects to idea endpoint)
  - `POST /marketing/refine`: Refine marketing ideas (redirects to idea endpoint)

- `styles.py`: Style listing endpoints
  - `GET /styles`: Get available video styles

- `video/`: Video generation endpoints
  - `video/luma.py`: Luma video generation endpoints
  - `video/heygen.py`: HeyGen video generation endpoints

## Backward Compatibility

These endpoints are also available at the root level (without the `/v0` prefix) for backward compatibility.

## Maintenance Policy

The v0 API is considered frozen and should only receive critical bug fixes. New features should be developed in v1 or newer versions. 