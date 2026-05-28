# AlterEgo Frontend

React/Vite frontend for the AlterEgo avatar generator.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Required `.env` values:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Main Flow

1. Sign in or create an account with Supabase email/password auth.
2. Upload a headshot.
3. Pick up to three avatar styles.
4. Create a generation job.
5. Watch updates over SSE.
6. Download the original image or ImageKit variants from the gallery.
