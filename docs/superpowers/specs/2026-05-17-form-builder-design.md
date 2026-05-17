# FieldKit Form Builder Design

**Date:** 2026-05-17  
**Scope:** Form builder — three-panel editor with drag-drop, field settings, and DB persistence

---

## Overview

A full-viewport three-panel form builder matching `builder.html` prototype. Client-side state via `useReducer`. Pointer-based drag-and-drop (no library). Auto-save to PostgreSQL via Prisma. Auth stubbed with `DEV_USER_ID` — one-line swap when real auth lands.

---

## File Structure

```
apps/web/src/
├── app/
│   ├── forms/
│   │   └── new/
│   │       └── page.tsx              # Redirects: creates form, redirects to /forms/[id]
│   │   └── [id]/
│   │       └── page.tsx              # Server Component: fetches form, renders BuilderShell
│   └── api/
│       └── forms/
│           ├── route.ts              # POST /api/forms (create new form)
│           └── [id]/
│               └── route.ts          # GET + PATCH /api/forms/[id]
├── components/
│   └── builder/
│       ├── builder-shell.tsx         # 'use client' root — context provider + layout
│       ├── builder-nav.tsx           # Top nav: title input, Preview/Save/Publish
│       ├── field-sidebar.tsx         # Left panel: 10 field type buttons
│       ├── canvas.tsx                # Center: form card with drag-drop field list
│       ├── field-item.tsx            # Individual draggable field preview
│       └── settings-panel.tsx        # Right panel: field settings, validation, options
└── lib/
    ├── builder-context.tsx           # BuilderContext + useReducer + auto-save
    ├── builder-types.ts              # BuilderField, BuilderState, BuilderAction types
    └── dev-auth.ts                   # DEV_USER_ID stub
```

---

## Types (`lib/builder-types.ts`)

```ts
import type { Field, FieldType, FormSettings } from '@fieldkit/form-schema'

export interface BuilderField extends Field {
  // Field from form-schema: id, type, label, placeholder, helpText, required, options, validation
}

export interface BuilderState {
  formId: string
  title: string
  description: string
  fields: BuilderField[]
  selectedId: string | null
  isDirty: boolean
  isSaving: boolean
  isPublished: boolean
}

export type BuilderAction =
  | { type: 'ADD_FIELD'; fieldType: FieldType }
  | { type: 'SELECT_FIELD'; id: string | null }
  | { type: 'UPDATE_FIELD'; id: string; patch: Partial<BuilderField> }
  | { type: 'REORDER_FIELDS'; fromIndex: number; toIndex: number }
  | { type: 'DELETE_FIELD'; id: string }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'MARK_CLEAN' }
  | { type: 'SET_PUBLISHED'; isPublished: boolean }
```

---

## BuilderContext (`lib/builder-context.tsx`)

`'use client'` — React context + `useReducer` + auto-save effect.

**Reducer logic:**
- `ADD_FIELD`: appends field with `id: crypto.randomUUID()`, default label from field type name, `required: false`, empty options for select/radio/checkbox (`['Option 1', 'Option 2', 'Option 3']`). Sets `isDirty: true`.
- `SELECT_FIELD`: sets `selectedId`.
- `UPDATE_FIELD`: merges patch into matching field. Sets `isDirty: true`.
- `REORDER_FIELDS`: moves field from `fromIndex` to `toIndex`. Sets `isDirty: true`.
- `DELETE_FIELD`: removes field, sets `selectedId: null` if deleted field was selected. Sets `isDirty: true`.
- `SET_TITLE` / `SET_DESCRIPTION`: updates metadata. Sets `isDirty: true`.
- `SET_SAVING`: sets `isSaving`.
- `MARK_CLEAN`: sets `isDirty: false`.
- `SET_PUBLISHED`: sets `isPublished`.

**Auto-save effect:** watches `isDirty`. When true, debounces 1000ms, calls `PATCH /api/forms/[formId]` with serialized form state. Dispatches `SET_SAVING(true)` before, `SET_SAVING(false)` + `MARK_CLEAN` after.

**Context value:** `{ state, dispatch }`.

**`useBuilder()` hook:** throws if used outside provider.

---

## Dev Auth (`lib/dev-auth.ts`)

```ts
export const DEV_USER_ID = 'dev-user-001'
```

Used in all API routes as `userId`. Replace with `auth()` from `src/lib/auth.ts` when real auth is wired.

---

## API Routes

### `POST /api/forms`

Creates a new Form in DB:
```ts
const form = await db.form.create({
  data: {
    title: 'Untitled form',
    description: '',
    schema: { fields: [], settings: { submitButtonText: 'Submit', confirmationMessage: 'Thank you!', allowMultipleSubmissions: false } },
    userId: DEV_USER_ID,
  }
})
return Response.json({ id: form.id })
```

### `GET /api/forms/[id]`

Returns form with schema. Returns 404 if not found or userId doesn't match.

### `PATCH /api/forms/[id]`

Accepts body: `{ title, description, fields, settings, published? }`. Updates form in DB. Returns `{ ok: true }`.

---

## Pages

### `app/forms/new/page.tsx`

Server Component. Calls `db.form.create` directly (not via fetch — RSC can't call same-origin API routes without absolute URL), then `redirect('/forms/[id]')`.

### `app/forms/[id]/page.tsx`

Server Component. Fetches form via `GET /api/forms/[id]`. If not found → `notFound()`. Passes initial state to `<BuilderShell>`.

---

## Components

### `builder-shell.tsx` — `'use client'`

Wraps everything in `BuilderContext.Provider`. Renders full-viewport layout:
```
<div className="flex h-dvh flex-col overflow-hidden">
  <BuilderNav />
  <div className="grid flex-1 grid-cols-[260px_1fr_300px] overflow-hidden">
    <FieldSidebar />
    <Canvas />
    <SettingsPanel />
  </div>
</div>
```

### `builder-nav.tsx`

- Left: "FieldKit" logo → `/`, `/` separator (muted), inline title `<input>` (transparent bg, pill border on hover/focus, max-width 280px, display font 15px weight 500)
- Right: Preview button (ghost, eye icon, opens `/forms/[id]/preview` in new tab), Save draft button (secondary, shows "Saved!" 1.5s), Publish button (primary, dispatches `SET_PUBLISHED(true)` + triggers save)
- Saving indicator: small muted "Saving…" text when `isSaving`

### `field-sidebar.tsx`

Left panel, 260px, border-right, scrollable. Section label "FIELD TYPES" (monospace 11px uppercase muted). 10 field type buttons:

| Type | Label |
|------|-------|
| text | Text input |
| email | Email |
| number | Number |
| textarea | Long text |
| select | Dropdown |
| radio | Single choice |
| checkbox | Multiple choice |
| date | Date |
| file | File upload |
| rating | Rating |

Each button: full width, 1px border, 12px radius, flex row with 18px SVG icon (muted, accent on hover) + label. Click → `dispatch({ type: 'ADD_FIELD', fieldType: type })`.

SVG icons inlined from `builder.html` prototype.

### `canvas.tsx`

Center panel, surface bg, scrollable, padding 40px, flex column align-center.

Form card: white bg, 1px border, 12px radius, max-width 540px, padding 40px.

**Form header:**
- `<h2 contentEditable>` — display font 24px, transparent border, hover: surface bg + border, focus: surface bg + black border. `onInput` → `SET_TITLE`
- `<p contentEditable>` — 14px muted, same hover/focus style, placeholder "Add a form description…" via CSS `::before`. `onInput` → `SET_DESCRIPTION`

**Fields list:** maps `state.fields` → `<FieldItem>` with drag handlers passed down.

**Empty state:** centered muted text "Click a field type on the left to start building your form" when `fields.length === 0`.

**Drag state:** managed in `canvas.tsx` via `useRef` — ghost element appended to `document.body`, placeholder div inserted in fields list. On `pointerdown` (5px threshold) → create ghost + placeholder. On `pointermove` → move ghost, reposition placeholder. On `pointerup` → `REORDER_FIELDS(fromIndex, toIndex)`, remove ghost + placeholder.

### `field-item.tsx`

Renders one field. Props: `field: BuilderField`, `isSelected: boolean`, `onSelect: () => void`, drag event handlers.

- Container: 2px border (transparent → border on hover → black when selected), 12px radius, padding 16px, `cursor: grab`
- Drag handle: `⠿` character, absolute left, vertically centered, opacity 0 → 1 on hover
- Label: 14px weight 500, red `*` if required
- Field preview (all disabled/non-interactive):
  - `text/email/number/date`: `<input type={type}>`
  - `textarea`: `<textarea>`
  - `select`: `<select>` with options
  - `radio`: radio group with options
  - `checkbox`: checkbox group with options
  - `file`: dashed border drop zone div
  - `rating`: 5 star characters in muted color
- Help text: 12px muted, shown only when non-empty

### `settings-panel.tsx`

Right panel, 300px, border-left, scrollable, padding 20px.

**No selection:** centered muted "Select a field to edit its settings".

**Field selected** — reads `state.fields.find(f => f.id === state.selectedId)`:

Section: **Basic**
- Label input → `UPDATE_FIELD(id, { label })`
- Placeholder input (text/email/number/textarea only) → `UPDATE_FIELD(id, { placeholder })`
- Help text input → `UPDATE_FIELD(id, { helpText })`

Section: **Behavior**
- Required toggle → `UPDATE_FIELD(id, { required })`

Section: **Validation** (text/email/number/textarea only)
- Min length (number input) → `UPDATE_FIELD(id, { validation: { ...validation, minLength } })`
- Max length (number input) → `UPDATE_FIELD(id, { validation: { ...validation, maxLength } })`
- Pattern (text input, placeholder `^[A-Za-z ]+$`) → `UPDATE_FIELD(id, { validation: { ...validation, pattern } })`

Section: **Options** (select/radio/checkbox only)
- List of text inputs, one per option → `UPDATE_FIELD(id, { options: [...] })`
- × button per option (removes it)
- "+ Add option" button (appends "New option")

**Delete field button:** full width, danger color, bottom of panel → `DELETE_FIELD(id)`

---

## Toggle Component

Reusable `<Toggle checked={bool} onChange={fn} />` — 36×20px pill, border bg when off, foreground bg when on, white circle slides. Used for Required toggle.

---

## Design Tokens

All colors use CSS variables — dark mode automatic:
- `var(--foreground)`, `var(--background)`, `var(--surface)`, `var(--muted)`, `var(--border)`, `var(--accent)`
- Danger: `#dc2626` (hardcoded — not in current CSS vars, add to globals.css)

---

## Responsive

- Desktop (>1024px): `260px | 1fr | 300px`
- Tablet (768–1024px): `220px | 1fr | 260px`
- Mobile (<768px): single column, sidebars hidden, canvas full width

---

## What Is NOT in Scope

- No real authentication (DEV_USER_ID stub)
- No form preview page (separate spec)
- No dashboard/form list (separate spec)
- No published form serving (separate spec)
- No file upload implementation (MinIO wiring comes later)
- No real-time collaboration
