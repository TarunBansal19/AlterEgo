# AlterEgo

AlterEgo is a small full-stack avatar generator. Users sign in with Supabase Auth, upload a headshot, choose up to three visual styles, and the backend creates AI avatars with Replicate before storing them in ImageKit.

## Stack

- Frontend: React, Vite, Tailwind, Axios
- Backend: FastAPI, SQLModel, PostgreSQL/Supabase
- Auth: Supabase JWTs
- Generation: Replicate Flux Kontext
- Storage/CDN: ImageKit

## Project Layout

```text
backend/
  main.py
  routes.py
  models.py
  database.py
  services/
    auth.py
    generator.py
    image_service.py
    imagekit_service.py
    cleanup.py

frontend/
  src/
    pages/
    components/
    context/
    hooks/
    api/
    constants/
```

## Backend Setup

Create `backend/.env`:

```env
REPLICATE_API_TOKEN=...
IMAGEKIT_PRIVATE_KEY=...
IMAGEKIT_PUBLIC_KEY=...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/...
DATABASE_URL=postgresql://...
SUPABASE_JWT_SECRET=...
SUPABASE_URL=https://your-project.supabase.co
```

Install and run:

```bash
cd backend
python -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Frontend Setup

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Install and run:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## API

All backend routes are mounted under `/api`.

- `POST /upload-headshot` uploads the selected headshot to ImageKit.
- `GET /styles` returns supported backend style IDs.
- `POST /job` creates an avatar generation job.
- `GET /jobs` returns the signed-in user's jobs and generated avatars.
- `GET /jobs/{job_id}` returns one job.
- `GET /jobs/{job_id}/stream?token=...` streams avatar progress with SSE.
- `DELETE /avatars/{avatar_id}` removes an avatar record.

## Notes

- The frontend sends Supabase access tokens as `Authorization: Bearer <token>`.
- Generated image variants are ImageKit transformation URLs for profile, banner, and story formats.
- Backend startup needs network access to Supabase/Postgres.
