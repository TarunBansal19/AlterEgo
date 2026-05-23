# AlterEgo — AI Avatar Branding Platform

> Transform any headshot into a stunning AI-generated avatar across multiple branding styles — professional, cinematic, cyberpunk, and more.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
5. [Database Diagram](#database-diagram)
6. [Generation Pipeline](#generation-pipeline)
7. [API Reference](#api-reference)
8. [Avatar Styles](#avatar-styles)
9. [Authentication & Tiers](#authentication--tiers)
10. [ImageKit Integration](#imagekit-integration)
11. [Headshot Cleanup](#headshot-cleanup)
12. [Environment Variables](#environment-variables)
13. [Setup & Run](#setup--run)
14. [CORS](#cors)
15. [Status Lifecycles](#status-lifecycles)

---

## Overview

AlterEgo is a full-stack AI avatar generation platform. Users upload a headshot, choose from a set of visual style presets, and receive AI-generated branded portraits — stored on CDN and accessible in real-time via Server-Sent Events.

| Capability     | Description                                                                 |
|----------------|-----------------------------------------------------------------------------|
| Auth           | Supabase JWT (Bearer header or `?token=` for SSE)                           |
| Uploads        | User headshots → ImageKit (`headshots/` folder)                             |
| Jobs           | Avatar jobs with a text prompt + one or more style presets                  |
| Generation     | OpenAI Responses API (`gpt-image-2`) from headshot URL + style prompt       |
| Storage        | Generated avatars → ImageKit (`Avatars/{job_id}/`)                          |
| Persistence    | Jobs and avatars in SQL via SQLModel                                         |
| Cleanup        | Background task deletes headshots from ImageKit after 24 hours              |
| Real-time      | Server-Sent Events (SSE) stream for live job progress                       |

---

## Tech Stack

### Backend

| Layer       | Technology                                                   |
|-------------|--------------------------------------------------------------|
| Framework   | [FastAPI](https://fastapi.tiangolo.com/) 0.136               |
| Server      | [Uvicorn](https://www.uvicorn.org/)                          |
| ORM         | [SQLModel](https://sqlmodel.tiangolo.com/) / SQLAlchemy      |
| Auth        | PyJWT + Supabase JWKS (ES256/RS256) or shared secret (HS256) |
| AI          | OpenAI Python SDK (`AsyncOpenAI`), `gpt-image-2`             |
| CDN / Files | [ImageKit](https://imagekit.io/) (`imagekitio` SDK)          |
| Config      | `python-dotenv`                                              |

### Frontend

| Layer       | Technology                              |
|-------------|-----------------------------------------|
| Framework   | [TanStack Start](https://tanstack.com/) + React |
| Auth client | Supabase JS SDK                         |
| Dev server  | Vite (`http://localhost:5173`)           |

---

## Project Structure

```
alterego/
├── backend/
│   ├── main.py                 # FastAPI app, lifespan, CORS, router mount
│   ├── routes.py               # /api endpoints, request/response schemas, SSE
│   ├── models.py               # Job, Avatar SQLModel tables
│   ├── database.py             # Engine, create_tables(), get_session()
│   ├── config.py               # Environment variable loader
│   ├── requirements.txt
│   ├── README.md
│   └── services/
│       ├── auth.py             # JWT validation, CurrentUser (user_id, tier)
│       ├── generator.py        # Job processing, STYLES, concurrent avatar workers
│       ├── openai_service.py   # OpenAI image generation call
│       ├── imagekit_service.py # Upload, delete, variant URL helpers
│       └── cleanup.py          # Hourly loop: delete expired headshots
└── frontend/
    ├── src/
    └── .env.example
```

---

## Architecture

```mermaid
flowchart TD
    Client[Frontend\nTanStack + React]

    subgraph Backend [FastAPI Backend]
        API[routes.py\n/api endpoints]
        Auth[auth.py\nJWT validation]
        Gen[generator.py\nJob processor]
        OAI[openai_service.py\nImage generation]
        IKS[imagekit_service.py\nCDN helpers]
        Cleanup[cleanup.py\nBackground task]
    end

    DB[(SQL Database\nSQLModel)]
    IK[ImageKit CDN]
    OpenAI[OpenAI API\ngpt-image-2]
    Supa[Supabase\nAuth / JWKS]

    Client -->|Bearer JWT| API
    API --> Auth
    Auth -->|JWKS / secret| Supa
    API --> DB
    API -->|upload headshot| IK
    API -->|asyncio.create_task| Gen
    Gen --> OAI
    OAI --> OpenAI
    Gen -->|upload avatar PNG| IKS
    IKS --> IK
    Gen --> DB
    Cleanup -->|delete expired headshots| IK
    Cleanup --> DB
    Client -->|SSE ?token=JWT| API
```

### Startup Sequence (`main.py` lifespan)

1. `create_tables()` — creates SQLModel tables if missing
2. Starts `cleanup_expired_headshots()` as an asyncio background task
3. On shutdown, cancels the cleanup task

### Typical Job Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant ImageKit
    participant Generator
    participant OpenAI
    participant DB

    User->>Frontend: Upload headshot + choose styles
    Frontend->>API: POST /api/upload-headshot
    API->>ImageKit: Upload to headshots/
    ImageKit-->>API: url + file_id
    API-->>Frontend: { url, file_id }

    Frontend->>API: POST /api/job { prompt, styles, headshot_url }
    API->>DB: INSERT Job + Avatar rows
    API-->>Frontend: { job_id }
    API-)Generator: asyncio.create_task(process_jobs)

    loop For each style (concurrent)
        Generator->>OpenAI: headshot URL + style prompt
        OpenAI-->>Generator: base64 PNG
        Generator->>ImageKit: Upload to Avatars/{job_id}/
        Generator->>DB: UPDATE Avatar status=completed + url
    end

    Frontend->>API: GET /api/jobs/{job_id}/stream (SSE)
    API-->>Frontend: avatar_ready events per style
    API-->>Frontend: job_completed event
```

---

## Database Diagram

```mermaid
erDiagram
    JOB {
        string  id              PK  "UUID"
        string  user_id             "Supabase sub (indexed)"
        string  prompt
        int     num_avatars
        string  headshot_url        "Cleared after cleanup"
        string  headshot_file_id    "ImageKit file ID"
        bool    headshot_deleted
        string  status              "pending | processing | completed | failed"
        datetime created_at         "UTC — used for 24h cutoff"
    }

    AVATAR {
        string   id             PK  "UUID"
        string   job_id         FK  "→ Job.id"
        string   style_name         "Key from STYLES"
        string   imagekit_url       "Set on completion"
        string   status             "pending | processing | completed | failed"
        string   error_message      "Truncated to 500 chars"
        datetime created_at         "UTC"
    }

    JOB ||--o{ AVATAR : "has"
```

Tables are created automatically on app startup via `SQLModel.metadata.create_all(engine)`.

---

## Generation Pipeline

### `process_jobs(job_id)` — `services/generator.py`

```mermaid
flowchart TD
    A[Set Job status → processing] --> B[Load all Avatar rows]
    B --> C{Run concurrently\nasyncio.gather}
    C --> D1[generate_single_Avatar style_1]
    C --> D2[generate_single_Avatar style_2]
    C --> D3[generate_single_Avatar style_N]
    D1 & D2 & D3 --> E{All failed?}
    E -->|Yes| F[Job status → failed]
    E -->|No| G[Job status → completed]
```

### `generate_single_Avatar(avatar_id, prompt, headshot_url)`

1. Avatar `status` → `processing`
2. Call `generate_avatar()` in `openai_service.py`
3. Decode base64 PNG response
4. Upload to ImageKit: `Avatars/{job_id}/{avatar_id}.png`
5. Avatar `status` → `completed` + save `imagekit_url`
   — or `failed` + `error_message` on any exception

### OpenAI call (`services/openai_service.py`)

- **Client:** `AsyncOpenAI(api_key=OPENAI_API_KEY, base_url="https://api.aicredits.in/v1")`
- **Model:** `gpt-image-2`
- **API:** `client.responses.create` with `input_text` + `input_image` (headshot URL) and `image_generation` tool
- **Output:** `1536×1024`, `medium` quality, PNG decoded from base64

The combined prompt sent to the model:

```
{style_prompt}

User request: {job.prompt}

IMPORTANT: Generate an avatar image that incorporates the user's headshot...
```

---

## API Reference

Base path: **`/api`**

All endpoints (except the SSE stream) require:

```http
Authorization: Bearer <supabase_access_token>
```

---

### `POST /api/upload-headshot`

Upload a user headshot image.

| | |
|---|---|
| **Body** | `multipart/form-data`, field `file` |
| **Auth** | Required |
| **ImageKit folder** | `headshots/` |

**Response**

```json
{
  "url": "https://ik.imagekit.io/...",
  "file_id": "..."
}
```

---

### `POST /api/job`

Create an avatar generation job and start async processing.

**Request body**

| Field                | Type       | Description                                      |
|----------------------|------------|--------------------------------------------------|
| `prompt`             | `string`   | User's free-text request merged into generation  |
| `selected_styles`    | `string[]` | Style keys from [Avatar Styles](#avatar-styles)  |
| `headshot_url`       | `string`   | ImageKit URL from the upload step                |
| `headshot_file_id`   | `string`   | ImageKit file ID (used for 24h cleanup)          |

**Validations**

- At least one style required
- Every style must exist in `STYLES`
- **Free tier:** max 3 styles; max 1 job total per user (403 if a job already exists)

**Response**

```json
{ "job_id": "<uuid>" }
```

---

### `GET /api/jobs`

List all jobs for the authenticated user, newest first.

**Response:** `JobResponse[]`

---

### `GET /api/jobs/{job_id}`

Single job with all avatar details. Returns **404** if missing or not owned by the caller.

**Response:** `JobResponse`

---

### `GET /api/jobs/{job_id}/stream`

Server-Sent Events stream for real-time avatar completion.

| | |
|---|---|
| **Auth** | Query param `?token=<JWT>` |
| **Poll interval** | 2 seconds |

**Events**

| Event           | When                      | Payload (`data` JSON)                                    |
|-----------------|---------------------------|----------------------------------------------------------|
| `avatar_ready`  | Avatar `completed`        | `avatar_id`, `style_name`, `imagekit_url`, `variants`   |
| `avatar_failed` | Avatar `failed`           | `avatar_id`, `style_name`, `error_message`              |
| `job_completed` | All avatars done          | `job_id`, `status`                                       |
| `error`         | Not found / unauthorized  | `{ "error": "Job not found" }`                           |

---

### Response Schemas

**`JobResponse`**

| Field               | Type              | Notes                         |
|---------------------|-------------------|-------------------------------|
| `id`                | string            | Job UUID                      |
| `prompt`            | string            |                               |
| `num_avatars`       | int               | Count of selected styles      |
| `headshot_url`      | string \| null    | Cleared after cleanup         |
| `headshot_deleted`  | bool              |                               |
| `status`            | string            | `pending \| processing \| completed \| failed` |
| `avatars`           | `AvatarResponse[]`|                               |

**`AvatarResponse`**

| Field           | Type           | Notes                             |
|-----------------|----------------|-----------------------------------|
| `id`            | string         |                                   |
| `style_name`    | string         |                                   |
| `imagekit_url`  | string \| null | Set when completed                |
| `status`        | string         | `pending \| processing \| completed \| failed` |
| `error_message` | string \| null | Truncated to 500 chars on failure |
| `variants`      | object \| null | ImageKit transform URLs           |

---

## Avatar Styles

Defined in `services/generator.py` as `STYLES`.

| Key                    | Theme                                                   |
|------------------------|---------------------------------------------------------|
| `professional_founder` | Corporate headshot, studio lighting, office background  |
| `anime_hero`           | High-quality anime / manga hero aesthetic               |
| `cyberpunk_hacker`     | Neon cyberpunk, holographic tech backdrop               |
| `gaming_streamer`      | RGB gaming setup, streamer energy                       |
| `cinematic_celebrity`  | Red-carpet, cinematic glamour                           |
| `luxury_ceo`           | High-status luxury portrait, wealth aesthetic           |

---

## Authentication & Tiers

Implemented in `services/auth.py`.

```mermaid
flowchart TD
    A[Extract Bearer token] --> B{Algorithm?}
    B -->|HS256| C[Verify with SUPABASE_JWT_SECRET\naudience: authenticated]
    B -->|ES256 / RS256| D[Fetch JWKS from Supabase\n/auth/v1/.well-known/jwks.json]
    C & D --> E[Extract sub → user_id]
    E --> F[Read app_metadata.tier\nor user_metadata.tier]
    F --> G{Tier present?}
    G -->|Yes| H[Use declared tier]
    G -->|No| I[Default: free]
```

`CurrentUser` model: `{ user_id, tier }`

SSE uses the same decoder with the token passed as `?token=...` query parameter.

---

## ImageKit Integration

**`services/imagekit_service.py`**

| Function                                          | Purpose                           |
|---------------------------------------------------|-----------------------------------|
| `upload_file(bytes, file_name, folder, type?)`    | Returns `(url, file_id)`          |
| `delete_file(file_id)`                            | Removes file from ImageKit        |
| `get_variants(base_url)`                          | Returns predefined transform URLs |

**Variant presets** (face-focused crops):

| Key       | Transform string         | Use case              |
|-----------|--------------------------|-----------------------|
| `profile` | `w-500,h-500,fo-face`    | Profile picture       |
| `banner`  | `w-1500,h-500,fo-face`   | LinkedIn / cover      |
| `story`   | `w-1080,h-1920,fo-face`  | Instagram Story       |

Appended as: `{base_url}?tr=w-500,h-500,fo-face`

---

## Headshot Cleanup

**`services/cleanup.py`** — runs forever in a background asyncio loop (started in app lifespan).

| Setting          | Value                                         |
|------------------|-----------------------------------------------|
| Retention        | 24 hours after `Job.created_at`               |
| Check interval   | Every 1 hour                                  |
| Criteria         | `headshot_deleted == false` + `headshot_file_id` present |
| Actions          | `delete_file(file_id)` → set `headshot_deleted = true` → clear `headshot_url` |
| On delete failure| Still marks `headshot_deleted` to avoid retry loops |

---

## Environment Variables

Loaded in `config.py` from `backend/.env`, with fallback to `frontend/alterego/.env` for shared keys.

| Variable                  | Required   | Description                               |
|---------------------------|------------|-------------------------------------------|
| `OPENAI_API_KEY`          | ✅ Yes     | OpenAI (or proxy) API key                 |
| `IMAGEKIT_PRIVATE_KEY`    | ✅ Yes     | ImageKit private key                      |
| `IMAGEKIT_PUBLIC_KEY`     | ✅ Yes     | ImageKit public key                       |
| `IMAGEKIT_URL_ENDPOINT`   | ✅ Yes     | e.g. `https://ik.imagekit.io/your_id`     |
| `DATABASE_URL`            | ✅ Yes     | SQLAlchemy connection string              |
| `SUPABASE_JWT_SECRET`     | ✅ HS256   | Required for HS256 JWT verification       |
| `SUPABASE_URL`            | ✅ ES256   | Supabase project URL; also used for JWKS. Falls back to `VITE_SUPABASE_URL` |

**Example `backend/.env`** — do not commit this file.

```env
OPENAI_API_KEY=sk-...
IMAGEKIT_PRIVATE_KEY=private_...
IMAGEKIT_PUBLIC_KEY=public_...
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
DATABASE_URL=postgresql://user:pass@host:5432/alterego
SUPABASE_JWT_SECRET=your-jwt-secret
SUPABASE_URL=https://xxxx.supabase.co
```

**`frontend/.env`**

| Variable                       | Example                       |
|--------------------------------|-------------------------------|
| `VITE_API_BASE_URL`            | `http://localhost:8000`       |
| `VITE_SUPABASE_URL`            | Your Supabase project URL     |
| `VITE_SUPABASE_PUBLISHABLE_KEY`| Supabase anon key             |

---

## Setup & Run

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` with the variables listed above, then:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- Interactive docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

> `database.py` sets `echo=True` on the SQLAlchemy engine — SQL queries are logged to the console.

---

### Frontend

```bash
cd frontend
cp .env.example .env   # fill in values
npm install
npm run dev            # http://localhost:5173
```

---

### Full Stack (local)

Run both in separate terminals:

```bash
# Terminal 1
cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2
cd frontend && npm run dev
```

---

## CORS

Configured in `main.py`:

| Setting             | Value                                                      |
|---------------------|------------------------------------------------------------|
| `allow_origins`     | `http://localhost:5173`, `http://127.0.0.1:5173`           |
| `allow_credentials` | `true`                                                     |
| `allow_methods`     | `*`                                                        |
| `allow_headers`     | `*`                                                        |

Update `allow_origins` with production frontend URLs before deploying.

---

## Status Lifecycles

**Job**

```
pending → processing → completed
                     ↘ failed  (only when every avatar fails)
```

**Avatar**

```
pending → processing → completed
                     ↘ failed
```

---

## Free Tier Rules

Enforced in `POST /api/job` when `current_user.tier == "free"`:

1. Maximum **3** styles per job
2. Maximum **1** job total per user — any existing `Job` row blocks new jobs (returns **403**)

Premium users (non-`free` tier in JWT metadata) have no such limits.

---

## Notes

- All protected routes use FastAPI `Depends(get_current_user)`; invalid or expired tokens return **401**.
- Job listing and detail endpoints are scoped by `user_id` — users cannot access other users' data.
- Avatar generation errors are stored on the avatar row; they are not surfaced as HTTP errors (async processing).
- The OpenAI client uses a custom `base_url` (`api.aicredits.in`). To switch to the official OpenAI endpoint, update `openai_service.py`.
- `PyJWT` may need to be pinned explicitly in `requirements.txt` if not pulled in transitively.