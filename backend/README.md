# AI Growth Operator Backend

This directory contains the FastAPI backend for the AI Growth Operator application.

## Running with Docker

```bash
# Build the Docker image
docker build -t ai_ugc_backend .

# Run the container using your existing .env file
docker run -p 80:80 ai_ugc_backend
```

This command mounts your local `.env` file into the container, which is the easiest approach if you already have your environment variables set up.

The API will be available at http://localhost:8000 when the container is running.
