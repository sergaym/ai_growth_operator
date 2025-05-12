# Text-to-Image API Examples

This document provides examples of requests and responses for the Text-to-Image API endpoints.

## Generate Image

### Endpoint

```
POST /api/v1/text-to-image/generate
```

### Request Example

```json
{
  "prompt": "a hyperrealistic portrait of a young woman smiling, high detail, studio lighting, professional photography style",
  "params": {
    "gender": "female",
    "age": "25",
    "ethnicity": "latina",
    "skin_tone": "medium",
    "hair_style": "wavy long",
    "hair_color": "brown",
    "facial_features": "soft features, small nose, full lips",
    "expression": "smiling",
    "style": "hyperrealistic",
    "background": "neutral grey studio backdrop",
    "lighting": "soft studio lighting",
    "custom_prompt": ""
  },
  "negative_prompt": "cartoon, illustration, drawing, blurry, distorted, low resolution",
  "num_inference_steps": 35,
  "guidance_scale": 8.0,
  "save_image": true
}
```

### Response Example

```json
{
  "request_id": "a7b3c9d8-e2f1-48g5-h6i7-j8k9l0m1n2o3",
  "prompt": "a hyperrealistic portrait of a young woman smiling, high detail, studio lighting, professional photography style",
  "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "image_urls": [
    "http://localhost:8000/api/v1/static/images/avatar_1684932145_0.png"
  ],
  "image_paths": [
    "/app/output/images/avatar_1684932145_0.png"
  ],
  "status": "completed",
  "timestamp": 1684932145
}
```

## Generate Avatar

### Endpoint

```
POST /api/v1/text-to-image/avatar
```

### Request Example

```json
{
  "gender": "female",
  "age": "25",
  "ethnicity": "latina",
  "skin_tone": "medium",
  "hair_style": "wavy long",
  "hair_color": "brown",
  "facial_features": "soft features, small nose, full lips",
  "expression": "smiling",
  "style": "hyperrealistic",
  "background": "neutral grey studio backdrop",
  "lighting": "soft studio lighting",
  "custom_prompt": "",
  "negative_prompt": "cartoon, illustration, drawing, blurry, distorted, low resolution",
  "num_inference_steps": 35,
  "guidance_scale": 8.0
}
```

### Response Example

```json
{
  "request_id": "b8c4d0e1-f2g3-49h6-i7j8-k9l0m1n2o3p4",
  "prompt": "Generate a hyperrealistic portrait of a woman, 25 years old of latina descent with medium skin tone, wavy long brown colored hair, soft features, small nose, full lips, with a smiling expression. The portrait should be extremely photorealistic, in hyperrealistic style with neutral grey studio backdrop background and soft studio lighting. Professional portrait photography, 8k, extremely detailed facial features, suitable for professional video avatars.",
  "image_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
  "image_urls": [
    "http://localhost:8000/api/v1/static/images/avatar_1684932245_0.png"
  ],
  "image_paths": [
    "/app/output/images/avatar_1684932245_0.png"
  ],
  "status": "completed",
  "timestamp": 1684932245
}
```

## Upload Image

### Endpoint

```
POST /api/v1/text-to-image/upload
```

### Request Example

```json
{
  "file_content": "base64_encoded_image_data",
  "filename": "my_portrait.png"
}
```

### Response Example

```json
{
  "url": "http://localhost:8000/api/v1/static/uploads/my_portrait_1684932345.png",
  "file_path": "/app/output/uploads/my_portrait_1684932345.png",
  "original_filename": "my_portrait.png",
  "mime_type": "image/png",
  "size_bytes": 1245789,
  "timestamp": 1684932345
}
```

## Parameter Guidelines

### Avatar Generation Parameters

| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| gender | Gender description | "male", "female", "non-binary" |
| age | Age description | "25", "middle-aged", "elderly" |
| ethnicity | Ethnicity/cultural background | "asian", "latina", "african" |
| skin_tone | Skin tone description | "fair", "medium", "dark" |
| hair_style | Hair style description | "short", "wavy long", "curly" |
| hair_color | Hair color description | "blonde", "brown", "black", "red" |
| facial_features | Notable facial features | "strong jawline", "soft features" |
| expression | Facial expression | "smiling", "serious", "surprised" |
| style | Visual style | "hyperrealistic", "stylized", "professional" |
| background | Background description | "solid color", "studio backdrop", "outdoors" |
| lighting | Lighting description | "soft studio lighting", "dramatic" |
| custom_prompt | Additional custom elements | "wearing glasses", "business attire" | 