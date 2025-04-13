FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Create a volume for potential data persistence
VOLUME /app/data

# Expose the API port
EXPOSE 80

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Use the entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"] 