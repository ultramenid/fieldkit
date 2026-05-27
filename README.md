# FieldKit

FieldKit is a form platform for teams collecting data in low-connectivity environments.

It combines:
- a **web app** for building and managing forms
- a **mobile app** for offline form collection in the field
- a **local server** for offline/LAN data collection

## Why FieldKit

Field teams often lose connectivity. FieldKit keeps form collection running locally on mobile devices or LAN servers, then syncs response data back to the main web app.

## Architecture

```text
Web App (Next.js) ── exports form config JSON ──▶ Mobile App (Expo)
Web App (Next.js) ── exports form config JSON ──▶ Local Server (Express)
Web App (Next.js) ◀── syncs collected responses ── Mobile App (Expo)
Web App (Next.js) ◀── imports collected responses ── Local Server (Express)
```

Data flow is intentionally one-way per domain:
- **Form config:** web → mobile / local
- **Responses:** mobile / local → web

The web app remains the source of truth for form definitions.

## Monorepo Structure

```text
.
├── apps/
│   └── web/                     # Next.js App Router application
├── packages/
│   ├── form-schema/             # Shared Zod schemas and TypeScript types
│   ├── local-server/            # Offline/LAN collection server (CLI)
│   └── mobile/                  # Expo SDK 54 mobile app
├── prototype/                   # HTML product/design prototypes
├── docker-compose.yml           # Local infra/services setup
└── CLAUDE.md                    # Project context and product constraints
```

## Main Capabilities

### Web app (`apps/web`)
- Google-authenticated workspace
- Form builder and preview
- Published form pages
- Response table with pagination and SSE realtime updates
- Import/export response/config workflows
- Mobile sync API with secret-based auth

### Mobile app (`packages/mobile`)
- Download form configs from web app
- Offline form filling and submission
- File upload (camera, gallery) support
- Background sync when online
- Multi-form store with Zustand

### Local server (`packages/local-server`)
- Serve forms on local machine/LAN
- Import form config via web UI
- Collect responses offline
- Export responses for upload to web app

## Tech Stack

- **Frontend/Web:** Next.js 16, React 19, TypeScript 6, Tailwind 4
- **Data:** PostgreSQL + Prisma 6 (`apps/web`)
- **Realtime:** SSE (Postgres LISTEN/NOTIFY + ReadableStream)
- **Validation:** Zod 4 (shared schemas in `packages/form-schema`)
- **Auth:** NextAuth.js 5 (Google OAuth, JWT sessions)
- **Storage/Uploads:** S3-compatible (MinIO or Cloudflare R2)
- **Mobile:** Expo SDK 54, React Native 0.81, Zustand 5
- **Local server:** Express 5 + Better-SQLite3 (sync, no async needed)
- **Testing:** Vitest 3 (API route handler tests)

## Prerequisites

- Node.js **20+**
- npm

## Getting Started

Install workspace dependencies:

```bash
npm install
```

### Run Web App

```bash
npm --prefix apps/web run dev
```

### Run Mobile App

```bash
cd packages/mobile && npx expo start
```

### Run Local Server (package dev)

```bash
npm --prefix packages/local-server run dev
```

### Run Tests

```bash
# Web API route tests
npm --prefix apps/web run test:api

# Type checking
npm --prefix apps/web run type-check
npm --prefix packages/local-server run build
cd packages/mobile && npx tsc --noEmit
```

### Build Targets

```bash
npm --prefix apps/web run build
npm --prefix packages/local-server run build
```

## Environment

Copy and adjust environment values from:

- `apps/web/.env.example`

For full deployment/env details, see `CLAUDE.md` and `docker-compose.yml`.

## Product Notes

- Form definitions are never edited on mobile or local server
- Local server import/export is UI-driven
- Mobile sync uses the form's generated mobile secret for auth
- Response deduplication is per-form by `(formId, submissionId)` compound unique
- Designed for NGO-style field collection workflows

## Status

This repository is actively evolving. Prototype screens in `prototype/` represent the intended UX and flow.
