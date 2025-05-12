# Lipsync API Documentation

The lipsync API allows you to synchronize a video's lip movements with the provided audio using the fal.ai latentsync model.

## Basic Usage

### 1. Upload your files (optional)

If you don't already have your video and audio files hosted somewhere, you can upload them using the `/api/v1/lipsync/upload` endpoint:

```bash
# Upload a video file
curl -X POST "http://localhost:8000/api/v1/lipsync/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/video.mp4" \
  -F "file_type=video"

# Upload an audio file
curl -X POST "http://localhost:8000/api/v1/lipsync/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/your/audio.mp3" \
  -F "file_type=audio"
```

### 2. Generate the lip-synchronized video

You can generate a lip-synchronized video by providing video and audio sources:

```bash
curl -X POST "http://localhost:8000/api/v1/lipsync/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://example.com/video.mp4",
    "audio_url": "https://example.com/audio.mp3",
    "save_result": true
  }'
```

## API Endpoints

### POST /api/v1/lipsync/generate

Generate a lip-synchronized video by providing a video and audio source.

#### Request Body

```json
{
  "video_path": "/path/to/video.mp4",  // Optional: Path to local video file
  "video_url": "https://example.com/video.mp4",  // Optional: URL to hosted video
  "audio_path": "/path/to/audio.mp3",  // Optional: Path to local audio file
  "audio_url": "https://example.com/audio.mp3",  // Optional: URL to hosted audio
  "save_result": true  // Whether to save the result locally
}
```

> Note: You must provide either `video_path` or `video_url` AND either `audio_path` or `audio_url`.

#### Response

```json
{
  "request_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "completed",
  "timestamp": 1620000000,
  "output_video_url": "https://example.com/results/lipsync_result.mp4",
  "output_video_path": "/path/to/output/lipsync_result.mp4",
  "local_video_url": "file:///path/to/output/lipsync_result.mp4",
  "input": {
    "video_url": "https://example.com/video.mp4",
    "audio_url": "https://example.com/audio.mp3"
  }
}
```

### POST /api/v1/lipsync/upload

Upload a video or audio file to be used in lipsync generation.

#### Request

- `file`: The file to upload (multipart/form-data)
- `file_type`: Type of file being uploaded (either "video" or "audio")

#### Response

```json
{
  "url": "https://example.com/uploads/filename.mp4",
  "filename": "filename.mp4",
  "file_type": "video"
}
```

### GET /api/v1/lipsync/examples

Get example requests for lipsync generation.

#### Response

```json
{
  "url_example": {
    "video_url": "https://example.com/video.mp4",
    "audio_url": "https://example.com/audio.mp3",
    "save_result": true
  },
  "path_example": {
    "video_path": "/path/to/video.mp4",
    "audio_path": "/path/to/audio.mp3",
    "save_result": true
  },
  "mixed_example": {
    "video_url": "https://example.com/video.mp4",
    "audio_path": "/path/to/audio.mp3",
    "save_result": true
  }
}
```

## Postman Collection

Here's a template for a Postman Collection to test the Lipsync API:

```json
{
  "info": {
    "name": "AI Growth Operator - Lipsync API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Upload Video",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{baseUrl}}/api/v1/lipsync/upload",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "lipsync", "upload"]
        },
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/your/video.mp4"
            },
            {
              "key": "file_type",
              "value": "video",
              "type": "text"
            }
          ]
        }
      }
    },
    {
      "name": "Upload Audio",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{baseUrl}}/api/v1/lipsync/upload",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "lipsync", "upload"]
        },
        "header": [],
        "body": {
          "mode": "formdata",
          "formdata": [
            {
              "key": "file",
              "type": "file",
              "src": "/path/to/your/audio.mp3"
            },
            {
              "key": "file_type",
              "value": "audio",
              "type": "text"
            }
          ]
        }
      }
    },
    {
      "name": "Generate Lipsync Video",
      "request": {
        "method": "POST",
        "url": {
          "raw": "{{baseUrl}}/api/v1/lipsync/generate",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "lipsync", "generate"]
        },
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"video_url\": \"https://example.com/video.mp4\",\n  \"audio_url\": \"https://example.com/audio.mp3\",\n  \"save_result\": true\n}"
        }
      }
    },
    {
      "name": "Get Examples",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{baseUrl}}/api/v1/lipsync/examples",
          "host": ["{{baseUrl}}"],
          "path": ["api", "v1", "lipsync", "examples"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:8000"
    }
  ]
}
```

## Error Handling

The API will return appropriate HTTP status codes:

- `400 Bad Request`: Invalid parameters
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Processing error or fal.ai API error

Errors will include a detail message explaining the issue.

## Technical Notes

- The lipsync service uses fal.ai's latentsync model
- Processing time varies but typically takes 30-60 seconds
- Supported video formats: MP4, MOV
- Supported audio formats: MP3, WAV, OGG
- The output is always MP4 video format 