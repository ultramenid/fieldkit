# FieldKit Docs Page Design

**Date:** 2026-05-17  
**Scope:** `app/docs/page.tsx` — static documentation page matching `docs.html` prototype

---

## Overview

A static documentation page with a sticky sidebar nav and scrollspy active state. All content is static JSX — no data fetching. Dark mode works automatically via CSS variables.

---

## File Structure

```
apps/web/src/
├── app/
│   └── docs/
│       └── page.tsx                    # Composes full docs layout
└── components/
    └── docs/
        ├── sidebar.tsx                 # Sticky sidebar with scrollspy (client component)
        ├── content.tsx                 # All doc sections as static JSX
        ├── code-block.tsx              # Reusable code block with comment/cmd coloring
        ├── callout.tsx                 # Reusable callout box (note/tip/important)
        └── data-table.tsx              # Reusable bordered table
```

---

## Layout

Two-column grid: `220px sidebar + 1fr content`, max-width 960px, centered.

- Sticky top nav (reuses existing `<Nav />` from `src/components/landing/nav.tsx`)
- Sidebar: sticky at `top: 60px`, `height: fit-content`, `max-height: calc(100dvh - 60px)`, scrollable overflow
- Content: `padding: 40px 48px`, `max-width: 720px`
- Mobile (< 768px): sidebar hidden, content full width, padding 24px

---

## Components

### `sidebar.tsx` — `'use client'`

Sticky sidebar with four section groups:

**Getting Started**
- Overview → `#overview`
- How it works → `#how-it-works`
- Quickstart → `#quickstart`

**Serverside**
- Create a form → `#create-form`
- Share & publish → `#share-form`
- Export config → `#export-config`
- View responses → `#responses`

**Local Server**
- Installation → `#install`
- Setup & config → `#setup`
- Running → `#run`
- Sync response data → `#sync`

**Reference**
- Config format → `#config-format`
- API endpoints → `#api`
- Troubleshooting → `#troubleshooting`

**Scrollspy:** Uses `IntersectionObserver` on all `h1[id]` and `h2[id]` elements in the content area. The link matching the most recently intersected heading gets the `active` style (foreground color + surface bg). On link click: `document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })`.

**Link styles:**
- Default: 14px, muted color, 8px radius, padding 6px 12px
- Hover: foreground color, surface bg
- Active: foreground color, surface bg, weight 500

**Section label styles:** monospace, 11px, uppercase, letter-spacing 0.06em, muted, margin-bottom 12px

### `code-block.tsx`

Props: `children: React.ReactNode`

- Surface bg, 1px border, 12px radius, padding 16px 20px, overflow-x auto
- Inner `<code>`: monospace, 13px, line-height 1.6, foreground color
- Supports two span variants via className:
  - `.comment` → muted color
  - `.cmd` → accent color (`var(--accent)`)

Since content is static JSX, code blocks are written with explicit `<span className="comment">` and `<span className="cmd">` spans inline.

### `callout.tsx`

Props: `title: string`, `children: React.ReactNode`

- Surface bg, 1px border, 12px radius, padding 16px 20px
- Title: monospace, 13px, uppercase, letter-spacing 0.04em, muted, weight 500, margin-bottom 8px
- Body: 14px, foreground

### `data-table.tsx`

Props: `headers: string[]`, `rows: React.ReactNode[][]`

- Outer wrapper: 1px border, 12px radius, overflow hidden
- `<table>`: full width, border-collapse collapse, 14px
- `<th>`: surface bg, 12px monospace uppercase, muted, border-bottom, padding 10px 16px, text-left
- `<td>`: padding 10px 16px, border-bottom
- Last row `<td>`: no border-bottom
- Inline `<code>` in cells: surface bg, monospace 13px, padding 2px 6px, radius 4px

### `content.tsx`

All 14 sections as static JSX, each wrapped in `<section id="...">`:

| Section ID | Heading |
|-----------|---------|
| `overview` | Documentation |
| `how-it-works` | How it works |
| `quickstart` | Quickstart |
| `create-form` | Create a Form |
| `share-form` | Share & Publish |
| `export-config` | Export Config |
| `responses` | View Responses |
| `install` | Local Server Installation |
| `setup` | Setup & Configuration |
| `run` | Running the Local Server |
| `sync` | Sync Response Data Back |
| `config-format` | Config File Format |
| `api` | API Endpoints |
| `troubleshooting` | Troubleshooting |

**h2 styles:** display font, 22px, weight 500, margin-top 48px, padding-top 24px, border-top 1px. First h2 has no border-top or top margin.

**Diagram (How it works section):**
```
[Serverside] → export config → [Local Server] → export data → [Serverside]
```
Surface bg box, border, 12px radius, padding 32px. Nodes are pill-bordered spans — green for Serverside, amber for Local Server.

**Step list:** CSS counter-based numbered list. Each item has a circular number badge (32px, surface bg, border, monospace 13px), padding-left 48px, border-bottom between items.

### `app/docs/page.tsx`

```tsx
import { Nav } from '@/components/landing/nav'
import { Sidebar } from '@/components/docs/sidebar'
import { DocsContent } from '@/components/docs/content'

export default function DocsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <div className="mx-auto w-full max-w-[960px] grid grid-cols-[220px_1fr] min-h-[calc(100dvh-60px)] max-md:grid-cols-1">
        <Sidebar />
        <DocsContent />
      </div>
    </div>
  )
}
```

---

## Design Tokens

All colors use CSS variables — dark mode works automatically:
- `var(--foreground)`, `var(--background)`, `var(--surface)`, `var(--muted)`, `var(--border)`, `var(--accent)`

---

## Responsive Behavior

- Desktop: two-column grid, sidebar visible
- Mobile (< 768px): sidebar hidden (`hidden md:block`), content full width, padding 24px

---

## What Is NOT in Scope

- No search functionality
- No edit-on-GitHub links
- No table of contents auto-generation
- No MDX or markdown parsing — all content is static JSX
