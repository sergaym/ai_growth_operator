#!/bin/bash
set -e

# Run the FastAPI application
exec uvicorn app.main:app --host 0.0.0.0 --port 80 