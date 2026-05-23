# AlterEgo Frontend

TanStack Start + React UI for the AlterEgo avatar studio.

## Environment

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

Optional for SSR/server routes:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Commands

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

The dev server must run on port **5173** (configured in `vite.config.ts`) so the FastAPI CORS policy accepts browser requests.
