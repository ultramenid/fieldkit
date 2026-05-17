# FieldKit Landing Page Design

**Date:** 2026-05-17  
**Scope:** `app/page.tsx` — static marketing/launcher page matching `fieldkit-launcher.html` prototype

---

## Overview

A pure Server Component landing page. No client-side JS, no data fetching. Translates the `fieldkit-launcher.html` prototype 1:1 into Next.js + Tailwind components.

---

## File Structure

```
apps/web/src/
├── app/
│   └── page.tsx                        # Composes all landing sections
└── components/
    └── landing/
        ├── nav.tsx                     # Top nav: logo + links
        ├── hero.tsx                    # h1, subtext, CTA buttons
        ├── screen-card.tsx             # Reusable card (icon, title, desc, tag)
        ├── workflow-strip.tsx          # "Build → Export → Import → Collect → Sync" flow
        └── install-snippet.tsx         # Two code boxes (install + serve commands)
```

---

## Components

### `nav.tsx`

Top navigation bar, max-width 960px centered, border-bottom.

- Left: "FieldKit" logo in display font (SF Pro Rounded / system-ui), 22px, weight 500
- Right: pill-bordered links — "Docs" → `/docs`, "Sign in" → `/auth/signin`, "Dashboard" → `/dashboard`
- Link style: 14px, muted color, 1px border, pill radius, hover darkens border + text to black

### `hero.tsx`

Centered section, max-width 520px, padding 80px top / 60px bottom.

- `<h1>`: "Build forms online, collect data anywhere" — display font, 42px, weight 500, line-height 1.1
- `<p>`: "Create rich forms in the cloud, deploy them to local networks for offline data collection. Built for NGOs and field teams." — 17px, muted, max 48ch
- CTA row (flex, centered, gap 12px, wraps on mobile):
  - Primary button: "Get started" → `/auth/signin` — black bg, white text, pill
  - Secondary button: "Documentation" → `/docs` — white bg, black text, border, pill

### `screen-card.tsx`

Reusable card component. Props: `href`, `icon` (SVG ReactNode), `title`, `description`, `tag`, `tagVariant: 'server' | 'local'`.

SVG icons are inlined from the prototype (`fieldkit-launcher.html`) — one unique icon per card. Each is a 24×24 viewBox, stroke-based, stroke-width 1.5, no fill.

- Border 1px, radius 12px, padding 24px, flex column, gap 12px
- Hover: border darkens to black
- Icon box: 40×40px, radius 10px, surface bg (#fafafa), border, SVG 20×20 muted
- Title: 16px, weight 500
- Description: 13px, muted
- Tag: pill, 11px monospace, border
  - `server` variant: green text (#16a34a) + green-tinted border
  - `local` variant: amber text (#b45309) + amber-tinted border

### `workflow-strip.tsx`

"How it works" section. Surface bg (#fafafa), border, radius 12px, padding 24px.

Steps (flex row, centered, wraps on mobile):
1. "Build form online" — green pill border
2. "Export config" — default border
3. "Import to local" — amber pill border
4. "Collect offline" — amber pill border
5. "Sync responses" — green pill border

Arrows between steps: "→" in muted, 11px.

Subtext below: "No internet required during data collection. Works on any local network." — 12px, muted, centered.

### `install-snippet.tsx`

Two-column grid (1fr 1fr, collapses to 1 col on mobile), gap 16px.

Left box — "Quick install":
- Label: `QUICK INSTALL` in monospace, 11px, uppercase, muted
- Code: `npm install -g @fieldkit/local-server` in monospace, 13px

Right box — "Start serving":
- Label: `START SERVING`
- Code: `fieldkit serve`
- Subtext: "Then open the admin panel to import configs via the web UI." — 12px, muted

### `app/page.tsx`

Composes sections in order:
1. `<Nav />`
2. `<Hero />`
3. Screens section (max-width 960px, padding 0 24px 80px):
   - "SERVERSIDE" label → 3 server screen cards grid
   - Divider (1px border-top)
   - "LOCALSERVER" label → 3 local screen cards grid
   - Divider
   - "HOW IT WORKS" label → `<WorkflowStrip />`
   - `<InstallSnippet />`
4. `<footer>` — "FieldKit · Built for field teams" — 13px, muted, centered, border-top

---

## Screen Cards Data

### Serverside
| Title | Description | href |
|-------|-------------|------|
| Dashboard | View all forms, stats, share links, and export configurations | `/dashboard` |
| Form Builder | Drag-and-drop editor with field types, validation, and settings | `/forms/new` |
| Live Responses | Real-time table with filtering, import from local servers, and CSV export | `/dashboard` |

### Localserver
| Title | Description | href |
|-------|-------------|------|
| Local Server Admin | Manage imported forms, start/stop server, monitor connected devices, and export collected data | `/docs#local-server` |
| Installation Guide | Install via npm on Windows, macOS, or Linux. Docker image also available. | `/docs#install` |
| Response Data Sync | Export collected responses from local server and import into serverside to compile into one table. | `/docs#sync` |

---

## Design Tokens (Tailwind mapping)

| Token | Value | Tailwind |
|-------|-------|---------|
| bg | #ffffff | `bg-white` |
| surface | #fafafa | `bg-[#fafafa]` |
| fg | #000000 | `text-black` |
| muted | #737373 | `text-neutral-500` |
| border | #e5e5e5 | `border-neutral-200` |
| accent | #8b4513 | `text-accent` (custom) |
| radius pill | 9999px | `rounded-full` |
| radius container | 12px | `rounded-[12px]` |

---

## Responsive Behavior

- Mobile (< 640px): hero h1 shrinks to 32px, hero padding reduces, screen cards grid → 1 column, install snippet grid → 1 column
- Nav links stay visible on mobile (no hamburger needed — only 3 links)

---

## What Is NOT in Scope

- No authentication state (nav always shows "Sign in", not user avatar)
- No animations beyond CSS hover transitions
- No dynamic data
- No `/docs` or `/dashboard` pages (links are stubs)
