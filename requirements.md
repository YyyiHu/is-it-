# Is it? Requirements

## Goal

Build a small web app that prints a random epigram on the web. Visitors can load another epigram, enable or disable automatic reloading, and submit new epigrams. A Python backend provides storage.

## Assumptions

- No user accounts in v1. Visitors are anonymous.
- One shared backend and one shared PostgreSQL database for all visitors (dev & prod).
- Automatic reloading is client-side polling.
- All primary controls are in the header as icon buttons:
  - **Submission (pencil)** opens the contribute panel.
  - **Settings (gear)** opens auto-reload on/off and the interval.
- The center of the page displays the current epigram.
- A single **Load new** button floats at the bottom-right.
- **Frontend:** Vite + React 18 + Redux Toolkit (UI state) + TanStack Query (server state & refetch).
- **Backend:** FastAPI + SQLModel (on SQLAlchemy) + Alembic + Uvicorn.

## Scope using MoSCoW

### Must have

- Show a random **approved** epigram on first load.
- Floating **Load new** button (bottom-right) that fetches another epigram.
- **Settings** panel (from header) to toggle auto-reload (default: 10 minutes).
- **Contribute** panel (from header) to submit `text` + optional `author`.
- Python backend with persistent storage in PostgreSQL.

### Should have

- Basic validation on submissions.
- Clear empty, loading, and error states.
- Light write protection (simple rate limiting or CSRF token).

### Could have (future)

- Custom auto-reload interval selector (inside Settings).
- Browse list of approved epigrams with pagination.
- Search by text or author.
- **Accounts & login**, with per-user ownership.
- **Moderation (with roles):** only `moderator`/`admin` can approve/reject submissions.

### Will not have for now

- Real-time server push to all clients.
- Social sharing.

## Minimal API (v1)

- `GET  /api/epigrams/random` → returns a random **approved** epigram.
- `POST /api/epigrams` → creates a new epigram (v1: insert as **approved** by default since no moderation)  
  Body: `{ "text": "string", "author": "string (optional)" }`

> Moderation endpoints are deferred until accounts/roles exist.

## Data model sketch

**Epigram**

- `id` (PK, int)
- `text` (string)
- `author` (string, nullable)
- `status` (smallint) — numeric codes:
  - `0 = pending`
  - `1 = approved`
  - `2 = rejected`
    _(In v1, you can default to `1` on insert.)_
- `created_at` (timestamptz, default now)
- `update_at` (timestamptz, optional; useful for future features)

## Moderation (future, with roles)

When accounts are introduced, add RBAC:

- Roles: `user` (default), `moderator`/`admin`.
- Protected endpoints (auth + role check):
  - `POST /api/epigrams/{id}/approve` → `status = 1`
  - `POST /api/epigrams/{id}/reject` → `status = 2`
- Regular users cannot approve/reject.
- Numeric status mapping remains `0/1/2`.
