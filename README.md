# Fast Backend

## Overview

This backend is a FastAPI service for the AI Avatar Branding API. It supports authenticated user job creation, headshot uploads, AI avatar generation, file uploads to ImageKit, and automatic cleanup of expired headshots.

## What it does

- Receives authenticated requests using Supabase JWT tokens
- Uploads user headshots to ImageKit
- Creates avatar generation jobs with selected style prompts
- Uses OpenAI image generation to produce avatars from a headshot + text prompt
- Uploads generated avatars to ImageKit and stores URLs
- Persists jobs and avatars in a SQL database via `sqlmodel`
- Cleans up headshots older than 24 hours automatically

## Architecture

- `main.py` - FastAPI app initializer, lifespan startup/shutdown, CORS config
- `routes.py` - API router and endpoint implementations
- `models.py` - `Job` and `Avatar` SQLModel ORM models
- `database.py` - Database engine and session provider
- `config.py` - Environment configuration loader
- `services/auth.py` - Supabase JWT validation and user claim extraction
- `services/generator.py` - Job processing, generation workflow, and OpenAI integration
- `services/openai_service.py` - OpenAI image generation request logic
- `services/imagekit_service.py` - ImageKit upload/delete/variant URL helpers
- `services/cleanup.py` - Background task for deleting expired headshots

## API Endpoints

All endpoints are mounted under `/api`.

### `POST /api/upload-headshot`

- Uploads a user headshot image file
- Requires bearer auth
- Returns `url` and `file_id` from ImageKit

### `POST /api/job`

- Creates a new avatar generation job
- Request body includes `prompt`, `selected_styles`, `headshot_url`, and `headshot_file_id`
- Triggers asynchronous avatar generation for each selected style
- Enforces free-tier limits: max 3 styles and one free generation per user
- Returns `job_id`

### `GET /api/jobs`

- Returns a list of jobs for the authenticated user
- Includes avatar status and image URLs

### `GET /api/jobs/{job_id}`

- Returns detailed information for a single job
- Includes per-avatar status, image URLs, and variants

## Database

- Uses `sqlmodel` and SQLAlchemy
- Connection string is configured by `DATABASE_URL`
- Tables are created automatically on startup by `create_tables()`

Models:

- `Job`
  - `id`, `user_id`, `prompt`, `num_avatars`, `headshot_url`, `headshot_file_id`, `headshot_deleted`, `status`, `created_at`
- `Avatar`
  - `id`, `job_id`, `style_name`, `imagekit_url`, `status`, `error_message`, `created_at`

## Environment Variables

Required variables for backend operation:

- `OPENAI_API_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `DATABASE_URL`
- `SUPABASE_JWT_SECRET`
- `SUPABASE_URL`

## Installing Dependencies

```bash
cd backend
python -m pip install -r requirements.txt
```

## Running the Backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Notes

- The backend currently assumes Supabase JWT-based auth for protected endpoints.
- Headshots are deleted from ImageKit after 24 hours by a background cleanup loop.
- Avatar generation uses the OpenAI Responses API with `gpt-image-2`.
- The README is intentionally scoped to the backend only.
