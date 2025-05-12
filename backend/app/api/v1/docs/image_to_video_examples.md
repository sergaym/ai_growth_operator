# Image-to-Video API Examples

This document provides examples of requests and responses for the Image-to-Video API endpoints.

## Generate Video

### Endpoint

```
POST /api/v1/image-to-video/generate
```

### Request Example

```json
{
  "image_url": "https://example.com/images/portrait.jpg",
  "prompt": "Realistic, cinematic movement, subject talking and smiling naturally",
  "duration": "5",
  "aspect_ratio": "16:9",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.5,
  "save_video": true
}
```

### Response Example

```json
{
  "request_id": "a7b3c9d8-e2f1-48g5-h6i7-j8k9l0m1n2o3",
  "prompt": "Realistic, cinematic movement, subject talking and smiling naturally",
  "status": "completed",
  "timestamp": 1684932145,
  "parameters": {
    "duration": "5",
    "aspect_ratio": "16:9",
    "cfg_scale": 0.5
  },
  "video_url": "https://storage.googleapis.com/kling-video-output/12345.mp4",
  "video_path": "/app/output/videos/video_1684932145_a7b3c9d8.mp4",
  "preview_image_url": "https://storage.googleapis.com/kling-video-output/12345_preview.jpg"
}
```

## Generate Video from URL

### Endpoint

```
POST /api/v1/image-to-video/from-url
```

### Request Example

```json
{
  "image_url": "https://example.com/images/portrait.jpg",
  "prompt": "Elegant head movement, professional looking",
  "duration": "10",
  "aspect_ratio": "9:16",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.7
}
```

### Response Example

```json
{
  "request_id": "b8c4d0e1-f2g3-49h6-i7j8-k9l0m1n2o3p4",
  "prompt": "Elegant head movement, professional looking",
  "status": "completed",
  "timestamp": 1684932245,
  "parameters": {
    "duration": "10",
    "aspect_ratio": "9:16",
    "cfg_scale": 0.7
  },
  "video_url": "https://storage.googleapis.com/kling-video-output/67890.mp4",
  "video_path": "/app/output/videos/video_1684932245_b8c4d0e1.mp4",
  "preview_image_url": "https://storage.googleapis.com/kling-video-output/67890_preview.jpg"
}
```

## Generate Video from Base64 Image

### Endpoint

```
POST /api/v1/image-to-video/from-base64
```

### Request Example

```json
{
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "prompt": "Subtle facial animation, slight smile, blinking naturally",
  "duration": "5",
  "aspect_ratio": "1:1",
  "negative_prompt": "blur, distort, and low quality",
  "cfg_scale": 0.4
}
```

### Response Example

```json
{
  "request_id": "c9d5e0f1-g2h3-50i7-j8k9-l0m1n2o3p4q5",
  "prompt": "Subtle facial animation, slight smile, blinking naturally",
  "status": "completed",
  "timestamp": 1684932345,
  "parameters": {
    "duration": "5",
    "aspect_ratio": "1:1",
    "cfg_scale": 0.4
  },
  "video_url": "https://storage.googleapis.com/kling-video-output/13579.mp4",
  "video_path": "/app/output/videos/video_1684932345_c9d5e0f1.mp4",
  "preview_image_url": "https://storage.googleapis.com/kling-video-output/13579_preview.jpg"
}
```

## Upload and Generate Video

### Endpoint

```
POST /api/v1/image-to-video/from-file
```

### Request Example

This is a multipart/form-data request with the following fields:

- `file`: The image file to upload
- `prompt`: "Realistic, cinematic movement, high quality"
- `duration`: "5"
- `aspect_ratio`: "16:9"
- `negative_prompt`: "blur, distort, and low quality"
- `cfg_scale`: 0.5

### Response Example

```json
{
  "request_id": "d0e6f1g2-h3i4-51j8-k9l0-m1n2o3p4q5r6",
  "prompt": "Realistic, cinematic movement, high quality",
  "status": "completed",
  "timestamp": 1684932445,
  "parameters": {
    "duration": "5",
    "aspect_ratio": "16:9",
    "cfg_scale": 0.5
  },
  "video_url": "https://storage.googleapis.com/kling-video-output/24680.mp4",
  "video_path": "/app/output/videos/video_1684932445_d0e6f1g2.mp4",
  "preview_image_url": "https://storage.googleapis.com/kling-video-output/24680_preview.jpg"
}
```

## Parameter Guidelines

### Video Generation Parameters

| Parameter | Description | Allowed Values | Notes |
|-----------|-------------|----------------|-------|
| `duration` | Duration of the video in seconds | "5", "10" | Use 5 for shorter animations, 10 for more complex movements |
| `aspect_ratio` | Aspect ratio of the output video | "16:9", "9:16", "1:1" | 16:9 for landscape, 9:16 for portrait, 1:1 for square |
| `cfg_scale` | How closely to follow the prompt | 0.0-1.0 | Lower values allow more creativity, higher values follow prompt more closely |
| `prompt` | Text description for the animation | Any text | Be specific about desired movements and expressions |
| `negative_prompt` | What to avoid in the video | Any text | Helps prevent unwanted artifacts or movements |

### Best Practices

1. **Images**:
   - Use high-quality portrait images with clear faces
   - Ensure good lighting and minimal background distractions
   - Portraits with neutral expressions work best

2. **Prompts**:
   - Be specific about the type of movement you want
   - Include details about facial expressions and head movements
   - Specify the mood or style of the animation

3. **Duration and Aspect Ratio**:
   - Use 5-second duration for simple animations
   - Use 10-second duration for more complex movements
   - Match aspect ratio to your intended use case 