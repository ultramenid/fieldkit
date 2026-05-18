# FieldKit

FieldKit is a form platform for teams collecting data in low-connectivity environments.

It combines:
- a **web app** for building and managing forms
- a **local server** for offline/LAN data collection

## Why FieldKit

Field teams often lose connectivity. FieldKit keeps form collection running locally, then syncs response data back to the main web app.

## Architecture

```text
Web App (Next.js) ── exports form config JSON ──▶ Local Server (Express)
Web App (Next.js) ◀─ imports collected responses ── Local Server (Express)
```

Data flow is intentionally one-way per domain:
- **Form config:** web → local
- **Responses:** local → web

The web app remains the source of truth for form definitions.

## Monorepo Structure

```text
.
├── apps/
│   └── web/                 # Next.js App Router application
├── packages/
│   └── local-server/        # Offline/LAN collection server (CLI)
├── prototype/               # HTML product/design prototypes
├── docker-compose.yml       # Local infra/services setup
└── CLAUDE.md                # Project context and product constraints
```

## Main Capabilities

### Web app (`apps/web`)
- Google-authenticated workspace
- Form builder and preview
- Published form pages
- Response table with pagination and realtime updates
- Import/export response/config workflows

### Local server (`packages/local-server`)
- Serve forms on local machine/LAN
- Import form config via web UI
- Collect responses offline
- Export responses for upload to web app

## Tech Stack

- **Frontend/Web:** Next.js, React, TypeScript, Tailwind
- **Data:** PostgreSQL + Prisma (`apps/web`)
- **Local server:** Express + TypeScript
- **Storage/Uploads:** S3-compatible integration in web app

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
npm run --workspace @fieldkit/web dev
```

### Run Local Server (package dev)

```bash
npm run --workspace @malichamdan/fieldkit-local-server dev
```

### Build Targets

```bash
npm run --workspace @fieldkit/web build
npm run --workspace @malichamdan/fieldkit-local-server build
```

## Environment

Copy and adjust environment values from:

- `.env.example`

For full deployment/env details, see `CLAUDE.md` and `docker-compose.yml`.

## Product Notes

- Form definitions are not edited on local server
- Local server import/export is UI-driven
- Designed for NGO-style field collection workflows

## Status

This repository is actively evolving. Prototype screens in `prototype/` represent the intended UX and flow.
