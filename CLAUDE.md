# FieldKit — Project Context for Claude Code

## What is this?

FieldKit is a SaaS form builder (like Google Forms) with an offline-capable local server companion. Target users are NGOs collecting field data in areas with unreliable internet.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  SERVERSIDE (Next.js web app)                           │
│  - Google OAuth login                                   │
│  - Form builder (drag-drop, field settings, preview)    │
│  - Share forms online (link, QR, embed)                 │
│  - Real-time responses table                            │
│  - Export form config as JSON                           │
│  - Import response data from local servers              │
└──────────────────────────┬──────────────────────────────┘
                           │ JSON config file
                           ▼
┌─────────────────────────────────────────────────────────┐
│  LOCAL SERVER (npm package: @fieldkit/local-server)      │
│  - Install: npm install -g @fieldkit/local-server       │
│  - Start: fieldkit serve                                │
│  - Import config via web UI (not terminal)              │
│  - Serve forms on local network (LAN)                   │
│  - Collect responses offline                            │
│  - Export response data for serverside import           │
└─────────────────────────────────────────────────────────┘
```

## Data flow (one-way each)

- **Config**: serverside → local server (form definitions, never edited locally)
- **Responses**: local server → serverside (collected data synced back)
- The form master always lives on the serverside. Local server is serve-only.

## Prototype files (use as visual spec)

These HTML files in `./prototype/` define the exact UI to implement:

| File | Screen | Key features |
|------|--------|--------------|
| `login.html` | Sign in | Google OAuth only (no email/password) |
| `dashboard.html` | Form list | Search, stats, share modal, export config |
| `builder.html` | Form builder | Drag-drop fields, inline title/description editing, field settings panel, preview |
| `responses.html` | Responses table | Real-time data, filter by source, import local data, export CSV/JSON |
| `localserver.html` | Local server admin | Server status, import config via web UI, export response data |
| `preview.html` | Published form | Audience-facing form with validation, progress, submit |
| `docs.html` | Documentation | Installation, setup, sync workflow, API reference |
| `fieldkit-launcher.html` | Marketing/launcher | Product overview, links to all screens |

## Design system

- **Visual direction**: Ollama-inspired monochrome — pure white canvas, zero shadows
- **Colors**: Pure white bg (#ffffff), black fg (#000000), single warm accent (#8b4513) used sparingly
- **Typography**: SF Pro Rounded for display, system sans for body, monospace for code/data
- **Border radius**: Binary system — 12px for containers, 9999px (pill) for all interactive elements
- **Shadows**: None. Depth via borders and background shifts only.
- **Borders**: Always 1px, never heavier
- **Layout max-widths**:
  - All pages except the form builder: `max-width: 960px` centered
  - Responses table container: `max-width: 1080px` (table uses `table-layout: fixed`, no horizontal scroll)
  - Hero / text content sections: `max-width: 520px`
  - Form preview card (in builder canvas): `max-width: 540px`
  - Form builder: full viewport width (three-panel grid layout, no max-width constraint)

## Tech stack (recommended)

```
apps/
└── web/                    ← Next.js 14+ (App Router, TypeScript, Tailwind)
    ├── Auth: NextAuth.js with Google provider
    ├── Database: PostgreSQL (self-hosted or managed: Neon, Railway, Render)
    ├── ORM: Prisma or Drizzle ORM
    ├── Realtime: WebSocket server (Socket.io or ws) for live responses
    ├── Form schema: JSON stored in Postgres jsonb column
    └── File storage: S3-compatible (MinIO self-hosted, or Cloudflare R2)

packages/
└── local-server/           ← Express/Fastify, published to npm
    ├── Web UI: serves static HTML for admin + form rendering
    ├── Config import: via web UI file upload (drag-drop JSON)
    ├── Data storage: SQLite (local, portable)
    └── Export: JSON/CSV download from web UI

shared/
└── form-schema/            ← Shared TypeScript types
    ├── FormConfig type (field definitions, settings, metadata)
    └── ResponseData type (submissions with timestamps + source)
```

### Realtime architecture

```
┌─────────────────────────────────────────────────────┐
│  PostgreSQL                                          │
│  - LISTEN/NOTIFY on new response inserts            │
│  - Triggers fire on INSERT to responses table       │
└──────────────────────┬──────────────────────────────┘
                       │ pg_notify('new_response', payload)
                       ▼
┌─────────────────────────────────────────────────────┐
│  Next.js API Route (WebSocket upgrade)              │
│  - Listens to Postgres NOTIFY channel               │
│  - Broadcasts to connected clients via Socket.io    │
└──────────────────────┬──────────────────────────────┘
                       │ WebSocket push
                       ▼
┌─────────────────────────────────────────────────────┐
│  Browser (Responses table)                          │
│  - Socket.io client subscribes to form channel      │
│  - New rows appear instantly without polling        │
└─────────────────────────────────────────────────────┘
```

**Why this over Supabase:**
- No vendor lock-in — standard Postgres works anywhere
- Free to self-host (Docker Compose for dev, Railway/Render free tier for staging)
- Postgres LISTEN/NOTIFY is built-in, no extra service needed
- Socket.io handles reconnection, rooms (per-form channels), and fallback to polling

## Form field types to support

| Type | Settings |
|------|----------|
| Text input | Label, placeholder, help text, required, min/max length, regex pattern |
| Email | Label, placeholder, help text, required |
| Number | Label, placeholder, help text, required, min/max value |
| Long text (textarea) | Label, placeholder, help text, required, min/max length |
| Dropdown (select) | Label, options list, help text, required |
| Single choice (radio) | Label, options list, help text, required |
| Multiple choice (checkbox) | Label, options list, help text, required, max selections |
| Date | Label, help text, required, min/max date |
| File upload | Label, help text, required, accepted types, max size |
| Rating (stars) | Label, help text, required, max stars |

## Key behaviors

### Form Builder
- Drag-and-drop field reordering (pointer-based, not HTML5 drag)
- Click anywhere on a field to select it and show settings
- Inline-editable form title and description in the canvas
- Settings panel on the right: label, placeholder, help text, required toggle, validation rules, options editor
- Preview opens the form as respondents would see it

### Local Server
- Config import is done through the web UI (file upload), NOT terminal commands
- Terminal workflow is just: `npm install -g @fieldkit/local-server` → `fieldkit serve`
- Server serves forms on LAN at `http://localhost:3000` (accessible to other devices on network)
- Response export is also via web UI (download button)

### Responses Table
- Shows all submissions in real-time (Postgres LISTEN/NOTIFY → Socket.io WebSocket push)
- Can filter by source (online vs. specific local server)
- Import local server data (upload exported JSON)
- Deduplication on import (by submission ID + timestamp)
- Export as CSV, JSON, or XLSX

## Config JSON format

```json
{
  "formId": "uuid",
  "title": "Community Health Survey",
  "description": "Please fill out this form...",
  "version": 3,
  "exportedAt": "2026-05-14T09:00:00Z",
  "fields": [
    {
      "id": "f1",
      "type": "text",
      "label": "Full name",
      "placeholder": "Enter your name",
      "helpText": "",
      "required": true,
      "validation": { "minLength": 2, "maxLength": 100 }
    },
    {
      "id": "f2",
      "type": "select",
      "label": "District",
      "required": true,
      "options": ["North District", "South District", "East District"]
    }
  ],
  "settings": {
    "submitButtonText": "Submit",
    "confirmationMessage": "Thank you for your response.",
    "allowMultipleSubmissions": false
  }
}
```

## Implementation order (suggested)

1. Project setup (Next.js + Postgres + Prisma/Drizzle + shared types)
2. Google OAuth login (NextAuth.js with Google provider)
3. Dashboard (list forms, create new)
4. Form builder (drag-drop, settings panel, save to DB as jsonb)
5. Form preview / published form page
6. Responses table (real-time with Postgres NOTIFY + Socket.io)
7. Export config JSON
8. Local server package (Express + SQLite + web UI)
9. Local server: import config via web UI, serve form, collect responses
10. Local server: export response data via web UI
11. Serverside: import local response data with deduplication
12. Share form (link, QR code, embed snippet)
13. Documentation page

## Important constraints

- Login is Google OAuth ONLY (no email/password)
- Local server config import is via web UI only (no CLI import command)
- Form definitions are never edited on the local server
- Response data flows one direction: local → serverside
- The product name is "FieldKit"
- Target audience: NGOs collecting data in the field

## Deployment (zero-cost self-hosted)

The entire stack runs free on a single machine using Docker Compose. No paid services required.

### Docker Compose (production)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: fieldkit
      POSTGRES_USER: fieldkit
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-changeme}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U fieldkit"]
      interval: 5s
      timeout: 3s
      retries: 5

  minio:
    image: minio/minio:latest
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER:-fieldkit}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD:-changeme123}
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://fieldkit:${POSTGRES_PASSWORD:-changeme}@postgres:5432/fieldkit
      NEXTAUTH_URL: ${NEXTAUTH_URL:-http://localhost:3000}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:-generate-a-secret}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      S3_ENDPOINT: http://minio:9000
      S3_ACCESS_KEY: ${MINIO_USER:-fieldkit}
      S3_SECRET_KEY: ${MINIO_PASSWORD:-changeme123}
      S3_BUCKET: fieldkit-uploads
    ports:
      - "3000:3000"

volumes:
  postgres_data:
  minio_data:
```

### Environment variables (.env)

```bash
# .env (never commit this file)
POSTGRES_PASSWORD=your-secure-password
NEXTAUTH_SECRET=openssl-rand-base64-32-output
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
MINIO_USER=fieldkit
MINIO_PASSWORD=your-minio-password
```

### Dockerfile for the web app

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Running locally (development)

```bash
# Start Postgres + MinIO
docker compose up postgres minio -d

# Run the Next.js app in dev mode
cd apps/web
cp .env.example .env.local   # fill in your Google OAuth credentials
npx prisma migrate dev
npm run dev
```

### Running in production

```bash
# One command to start everything
docker compose up -d

# Run database migrations
docker compose exec web npx prisma migrate deploy

# View logs
docker compose logs -f web
```

### Free hosting alternatives

| Service | What to host | Free tier |
|---------|-------------|-----------|
| Railway | Postgres + Next.js | 500 hours/month, 1GB DB |
| Render | Next.js web service | 750 hours/month |
| Neon | Postgres only | 0.5GB storage, always free |
| Fly.io | Full stack | 3 shared VMs, 1GB persistent |
| VPS (Hetzner/OVH) | Everything | ~€4/month for 2GB RAM |

### Local server (separate — runs on field machines)

The local server is independent of Docker. Field staff install it globally:

```bash
npm install -g @fieldkit/local-server
fieldkit serve
```

Then open `http://localhost:3000` in a browser to import config and start collecting responses. Other devices on the same LAN can access the form at the machine's local IP (e.g. `http://192.168.1.50:3000`).
