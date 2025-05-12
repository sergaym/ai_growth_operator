# Text-to-Speech API Examples

This document provides examples of requests and responses for the Text-to-Speech API endpoints.

## Generate Speech

### Endpoint

```
POST /api/v1/text-to-speech/generate
```

### Request Example

```json
{
  "text": "Welcome to AI Growth Operator! We're excited to help you create engaging content for your marketing campaigns.",
  "voice_preset": "female_2",
  "language": "english",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.3,
    "use_speaker_boost": true
  }
}
```

### Response Example

```json
{
  "audio_url": "http://localhost:8000/api/v1/text-to-speech/audio/speech_1684932145_a7b3c9d8.mp3",
  "duration_seconds": 8.7,
  "text": "Welcome to AI Growth Operator! We're excited to help you create engaging content for your marketing campaigns.",
  "voice_id": "21m00Tcm4TlvDq8ikWAM",
  "voice_name": "Rachel",
  "model_id": "eleven_multilingual_v2"
}
```

## List Voices

### Endpoint

```
GET /api/v1/text-to-speech/voices
```

### Response Example

```json
{
  "voices": [
    {
      "voice_id": "21m00Tcm4TlvDq8ikWAM",
      "name": "Rachel",
      "description": "A warm and professional female voice with a subtle American accent",
      "preview_url": "https://api.elevenlabs.io/v1/voices/21m00Tcm4TlvDq8ikWAM/preview",
      "languages": ["english"],
      "gender": "female",
      "age": "adult",
      "accent": "american",
      "is_cloned": false
    },
    {
      "voice_id": "ErXwobaYiN019PkySvjV",
      "name": "Antoni",
      "description": "An energetic male voice with a British accent",
      "preview_url": "https://api.elevenlabs.io/v1/voices/ErXwobaYiN019PkySvjV/preview",
      "languages": ["english"],
      "gender": "male",
      "age": "young-adult",
      "accent": "british",
      "is_cloned": false
    }
    // More voices...
  ]
}
```

## Get Voice Presets

### Endpoint

```
GET /api/v1/text-to-speech/voices/presets?language=english
```

### Response Example

```json
{
  "male_1": "ErXwobaYiN019PkySvjV",
  "male_2": "VR6AewLTigWG4xSOukaG",
  "male_3": "pNInz6obpgDQGcFmaJgB",
  "female_1": "EXAVITQu4vr4xnSDxMaL",
  "female_2": "21m00Tcm4TlvDq8ikWAM",
  "female_3": "AZnzlk1XvdvUeBnXmlld",
  "neutral_1": "ThT5KcBeYPX3keUQqHPh"
}
```

## Common Voice Settings

For optimal results, consider these voice setting combinations:

### Natural, Expressive Speech
```json
{
  "stability": 0.3,
  "similarity_boost": 0.65,
  "style": 0.5,
  "use_speaker_boost": true
}
```

### Clear, Consistent Voice
```json
{
  "stability": 0.7,
  "similarity_boost": 0.85,
  "style": 0.2,
  "use_speaker_boost": true
}
```

### Highly Expressive, Emotional
```json
{
  "stability": 0.2,
  "similarity_boost": 0.6,
  "style": 0.8,
  "use_speaker_boost": true
}
``` 