# AI Growth Operator API v1 Documentation

Welcome to the API documentation for version 1 of the AI Growth Operator API.

## API Overview

The AI Growth Operator API provides access to various AI-powered content generation capabilities:

- **Text-to-Image Generation**: Generate realistic images and avatars from text descriptions
- **Text-to-Speech Generation**: Convert text to natural-sounding speech with various voices

## Available Endpoints

### Text-to-Image Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/text-to-image/generate` | POST | Generate an image from a text prompt |
| `/api/v1/text-to-image/avatar` | POST | Generate a portrait avatar with specific attributes |
| `/api/v1/text-to-image/upload` | POST | Upload an image for later use |

[View Text-to-Image examples](./text_to_image_examples.md)

### Text-to-Speech Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/text-to-speech/generate` | POST | Generate speech from text |
| `/api/v1/text-to-speech/voices` | GET | List available voices |
| `/api/v1/text-to-speech/voices/presets` | GET | List voice presets for a language |
| `/api/v1/text-to-speech/audio/{filename}` | GET | Get a generated audio file |

[View Text-to-Speech examples](./text_to_speech_examples.md)

## Authentication

All API endpoints require authentication. Include your API key in the request headers:

```
Authorization: Bearer YOUR_API_KEY
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- **200 OK**: Request successful
- **400 Bad Request**: Invalid input parameters
- **401 Unauthorized**: Missing or invalid API key
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side error

Error responses include a detail message:

```json
{
  "detail": "Error message describing what went wrong"
}
```

## Rate Limiting

The API is subject to rate limiting. Current limits are:

- 100 requests per minute
- 1000 requests per day

When rate limits are exceeded, the API responds with HTTP status code 429 (Too Many Requests).

## Support

For support, please contact [support@example.com](mailto:support@example.com) or refer to the complete [API Reference](https://docs.example.com/api). 