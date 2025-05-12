# AI Growth Operator Backend

This directory contains the FastAPI backend for the AI Growth Operator application.

## Running with Docker

```bash
# Build the Docker image
docker build -t ai-ugc-backend .

# Remove any existing container with the same name (if it exists)
docker rm -f ai-ugc-api 2>/dev/null || true

# Run the container using your existing .env file
docker run -p 8000:80 \
  --env-file ./.env \
  --name ai-ugc-api ai-ugc-backend
```

This command mounts your local `.env` file into the container, which is the easiest approach if you already have your environment variables set up.

The API will be available at http://localhost:8000 when the container is running.

## Alternative: Passing Individual Environment Variables

If you prefer not to use the .env file, you can also pass environment variables directly:

```bash
docker run -p 8000:80 \
  -e OPENAI_API_KEY=your_openai_key \
  -e LUMAAI_API_KEY=your_lumaai_key \
  -e HEYGEN_API_KEY=your_heygen_key \
  -e FAL_CLIENT_API_KEY=your_fal_key \
  -e HEDRA_API_KEY=your_hedra_key \
  -e ELEVENLABS_API_KEY=your_elevenlabs_key \
  --name ai-ugc-api ai-ugc-backend
``` 