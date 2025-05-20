# Repository Pattern

This directory contains the repository classes that provide a clean abstraction layer over the database operations. Each repository follows the repository pattern to encapsulate data access logic.

## Structure

- `__init__.py` - Exports all repository instances and classes
- `image_repository.py` - Repository for Image model operations
- `video_repository.py` - Repository for Video model operations
- `audio_repository.py` - Repository for Audio model operations
- `lipsync_repository.py` - Repository for LipsyncVideo model operations
- `legacy_repository.py` - Contains deprecated functions for backward compatibility

## Repository Pattern

The repository pattern provides several benefits:

1. **Separation of Concerns** - Database operations are isolated from the business logic
2. **Testability** - Repositories can be mocked for testing service layers
3. **Centralized Data Access Logic** - Query logic is centralized and reusable
4. **Abstraction** - Domain code doesn't need to know about database details

## Usage

Repositories are accessed through their singleton instances:

```python
from app.db import image_repository, video_repository, audio_repository

# Create a record
new_image = image_repository.create(data, db_session)

# Get a record by ID
video = video_repository.get_by_id(video_id, db_session)

# List records with pagination and filtering
audios = audio_repository.get_all(
    db=db_session,
    skip=0,
    limit=10,
    user_id="user123",
    status="completed"
)

# Count records with filtering
count = video_repository.count(
    db=db_session,
    status="processing"
)
```

## Legacy Functions

The `legacy_repository.py` file contains functions that interact with deprecated database tables. These functions will be removed in a future release and should not be used in new code. 