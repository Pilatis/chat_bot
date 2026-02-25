# AGENTS.md

## Cursor Cloud specific instructions

This is a two-project repository (not a monorepo with shared tooling) for **Botatende** — a WhatsApp chatbot SaaS.

### Services

| Directory | Role | Port | Dev command |
|---|---|---|---|
| `chatbot-backend/` | Express.js REST API (Node/TS, Prisma, PostgreSQL) | 3001 | `npm run dev` |
| `chatbot-saas/` | React SPA (Vite, Chakra UI, TypeScript) | 3000 | `npm run dev` |

Both use **npm** (lockfiles are `package-lock.json`).

### Prerequisites

- **PostgreSQL** must be running on localhost:5432. The backend needs a `DATABASE_URL` env var in `chatbot-backend/.env`.
- After `npm install` in the backend, run `npx prisma generate` and `npx prisma db push` to sync the schema, then `npm run db:seed` to create subscription plans.

### Backend `.env` (create `chatbot-backend/.env`)

```
DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/botatende"
JWT_SECRET="<any-dev-secret>"
JWT_REFRESH_SECRET="<any-dev-refresh-secret>"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### Running

1. Start PostgreSQL (`sudo pg_ctlcluster 16 main start`).
2. Backend: `cd chatbot-backend && npm run dev` (port 3001).
3. Frontend: `cd chatbot-saas && VITE_API_BASE_URL=http://localhost:3001/api npm run dev` (port 3000).

### Lint / Build

- **Frontend lint** (ESLint 8 with flat config conflict): use `ESLINT_USE_FLAT_CONFIG=false npx eslint . --ext ts,tsx` in `chatbot-saas/`. The `npm run lint` script as-is fails because `eslint.config.mjs` requires ESLint 9+ but ESLint 8 is installed.
- **Frontend build**: `npx vite build` works; `npm run build` (`tsc && vite build`) fails due to pre-existing TS errors (unused vars, type mismatches). Use `npx vite build` for a working build.
- **Backend TS check**: `npx tsc --noEmit` passes cleanly in `chatbot-backend/`.

### Gotchas

- The Chatbot test page (`/chatbot`) in the frontend requires a company to be configured for the logged-in user. Without a company, it stays on "Carregando histórico de conversas..." indefinitely. Create a company via the Empresa page first.
- The `@wppconnect-team/wppconnect` dependency (WhatsApp automation) is optional for core dev testing; it requires Chromium on the system. Core chatbot simulation works without it.
- The backend uses Express 5 (not 4). Route handler signatures differ slightly.
- No automated test suite exists (`npm test` is a placeholder in both projects).
