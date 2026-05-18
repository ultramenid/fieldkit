# FieldKit Mobile Client — Design Spec

## Summary

A cross-platform mobile app (React Native / Expo) that acts as a portable local server. Field workers scan a QR code to import form configs from the online server, collect responses offline using native form fields, and sync responses back when connectivity is available.

**Reference prototype:** `prototype/mobile-ios.html` — the visual spec for the app shell (form list, sync badges, tab bar, QR scan).

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│  MOBILE APP (Expo SDK 52, React Native)          │
│                                                  │
│  App Shell (Expo Router tabs)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  Forms   │  │   Scan   │  │   Settings   │   │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │                │           │
│  ┌────┴──────────────┴────────────────┴───────┐  │
│  │         SQLite (expo-sqlite)               │  │
│  │  forms    |  responses                     │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Sync Engine                              │   │
│  │  - @react-native-community/netinfo       │   │
│  │  - Auto-push unsynced when online         │   │
│  │  - Manual "Sync Now" button               │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Form Renderer (native components)        │   │
│  │  10 field types, FieldKit design system   │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │  Camera (expo-camera)                     │   │
│  │  QR code scanner for config import        │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
        │ config import               │ response sync
        ▼                             ▼
┌──────────────────────────────────────────────────┐
│  ONLINE SERVER (existing Next.js app)            │
│  GET  /api/forms/:id/export   ← config + secret  │
│  POST /api/mobile/responses    ← sync endpoint   │
└──────────────────────────────────────────────────┘
```

---

## Design System

Matches FieldKit web: monochrome palette, 1px borders, 12px/9999px radii, SF Pro Rounded for display. Native reimplementation of the same visual language.

| Token | Value |
|-------|-------|
| Background | `#ffffff` |
| Foreground | `#000000` |
| Muted | `#737373` |
| Border | `#e5e5e5` |
| Surface | `#fafafa` |
| Accent | `#000000` (used for submit/sync buttons) |
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Radius | 12px (containers), 9999px (buttons/tags/pills) |

---

## Database Schema (SQLite via expo-sqlite)

```sql
CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  config_json TEXT NOT NULL,
  secret TEXT NOT NULL,
  imported_at INTEGER NOT NULL,
  last_synced_at INTEGER
);

CREATE TABLE IF NOT EXISTS responses (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL REFERENCES forms(id),
  submission_id TEXT NOT NULL UNIQUE,
  data_json TEXT NOT NULL,
  submitted_at INTEGER NOT NULL,
  synced INTEGER DEFAULT 0
);
```

---

## Config Import Flow

1. User taps "Scan" tab → camera viewfinder opens
2. App scans QR code (the same QR from the web app's share modal)
3. QR contains URL: `{origin}/f/{formId}`
4. App extracts formId, constructs `{serverUrl}/api/forms/{formId}/export`
5. Fetches config JSON (includes `secret`, `fields`, `settings`, `description` with base64 images)
6. Stores in SQLite forms table
7. Shows success toast, navigates to Forms tab

**Server URL** is configurable in Settings tab. Defaults to the origin extracted from the QR code on first scan.

**Deduplication**: If form ID already exists in SQLite, show "This form is already imported. Update config?" dialog.

---

## Form Filling

### Entry point
Tap a form card in the Forms tab → navigates to `form/[id]` screen.

### Layout
- Form title (large, display font)
- Description (rendered via `react-native-render-html`, supports base64 images)
- Scrollable field list
- Progress bar at bottom (completed / total fields)
- Submit button (pill, full width, black bg/white text)

### Field Components (10 types, FieldKit-styled)

All fields follow the same structure:
- Label above the input (15px, weight 500)
- Input/control below (min 48px touch target)
- Help text below input (13px, muted)
- Validation error below input (13px, `#dc2626`)

| # | Type | Native Component | Key props |
|---|------|-----------------|-----------|
| 1 | Text input | `TextInput` | maxLength, placeholder |
| 2 | Email | `TextInput` | keyboardType="email-address" |
| 3 | Number | `TextInput` | keyboardType="numeric", min/max |
| 4 | Long text | `TextInput` multiline | numberOfLines=4, maxLength |
| 5 | Dropdown | Modal bottom sheet list | `options` array |
| 6 | Single choice | Touchable row list | `options` array, single select |
| 7 | Multiple choice | Checkbox row list | `options` array, maxSelections |
| 8 | Date | `DateTimePicker` (expo) | minDate/maxDate |
| 9 | File upload | `expo-image-picker` | camera/gallery, acceptedTypes, maxSize |
| 10 | Rating | Row of tappable stars | maxStars (default 5) |

**Field renderer component**: `FormRenderer` receives the `fields` array from config, maps each `field.type` to the corresponding component, passes `field.*` as props. Uses a flat list for scroll performance.

### Validation

Validates on field blur AND on submit. Shows inline error below the field.

- **required**: must have a value (truthy check)
- **minLength/maxLength**: string length range
- **pattern**: regex test
- **min/max**: numeric range
- **minDate/maxDate**: Date comparison
- **maxSelections**: for checkbox, enforce max checked count
- **maxSize/acceptedTypes**: for file, validate selected image

### Progress Bar

Tracks: `fields with value / total fields`. Always visible below the field list, above the submit button. Black fill on gray track. 3px height, 2px radius.

### Submission

1. Validate all fields → show errors if any fail
2. Generate `submissionId` (UUID v4)
3. Build response data: `{ answers: [{ fieldId, value }, ...], source: "mobile" }`
4. Insert into SQLite responses table (`synced = 0`)
5. Show confirmation screen (checkmark icon, "Response submitted", confirmation message from settings.confirmationMessage)
6. If settings.`allowMultipleSubmissions`: show "Submit another response" button, resets form
7. If not: show "Back to forms" button

### Description rendering

Use `react-native-render-html` with custom renderers for:
- `<img>` — base64 data URIs (no network needed)
- `<a>` — tappable links
- `<p>`, `<strong>`, `<em>`, `<u>` — text styles
- `<ul>`, `<ol>`, `<li>` — native lists
- `<blockquote>` — styled inset text
- `<pre>` — monospace code block

---

## Sync Engine

### Auto-sync
Listen to `@react-native-community/netinfo` connectivity changes:
- When `isConnected` becomes `true` → trigger sync
- Don't re-trigger if already syncing
- On app launch → check connectivity, sync if online

### Manual sync
"Sync Now" button in Forms tab header. Triggers same sync function.

### Sync logic
```
for each form with unsynced responses:
  batch responses (20 per request)
  POST {serverUrl}/api/mobile/responses
  Body: { formId, secret, responses: [...] }
  on success: mark responses as synced=1, update form.last_synced_at
  on failure: skip batch, log error
```

### Sync UI states
- **Idle**: "Last synced X min ago" (or "Never" if no sync yet)
- **Syncing**: spinner icon in sync button, button disabled, "Syncing..." label
- **Error**: red banner "Sync failed, will retry when online"
- **Complete**: success checkmark briefly, then "Last synced just now"

---

## Connection Banner

At top of screen, below status bar:
- **Online**: green dot + "Connected to server"
- **Offline**: yellow dot + "Offline — responses saved locally"

---

## Screens

### Forms Tab
- Header: "My Forms" with QR scan button (top right)
- Sync bar: "Last synced X min ago" + "Sync Now" button
- Form list: cards for each imported form
  - Title + sync badge (Synced/Pending/New)
  - Response count + field count
  - Field type tags (monospace, pill style)
- Empty state: icon + "No forms yet" + "Scan a QR code to import a form"
- Tap card → navigate to form filler

### Scan Tab
- Full-screen camera viewfinder
- QR code detection overlay (corner brackets)
- On scan: vibrate feedback → show modal "Importing form..." → download → success toast → navigate to Forms
- Permission handling: if camera denied, show "Enable camera access in Settings" with link

### Settings Tab
- Server URL: text input + "Save" button (stored in AsyncStorage)
- About: "FieldKit Mobile v1.0.0"
- "Sync All Now" button
- "Delete all data" button with confirmation dialog

### Form Filler Screen (form/[id])
- ScrollView with form fields
- Progress bar pinned at bottom
- Submit button pinned at bottom
- Confirmation screen (overlays after submit)

---

## Server API Changes Required

### 1. Add secret to exported config

Modify `GET /api/forms/[id]/export` to include a `secret` field:
```json
{
  "formId": "...",
  "secret": "sk_a1b2c3...",
  "fields": [...],
  "settings": {...},
  "title": "...",
  "description": "...",
  ...
}
```

The secret is generated per form per export. On re-export, generate a new secret. Server stores the current secret for each form.

### 2. Response sync endpoint

New `POST /api/mobile/responses`:
```
Body: {
  formId: string,
  secret: string,
  responses: [
    { submissionId, submittedAt, source: "mobile", answers: [{ fieldId, value }] },
    ...
  ]
}
```
- Validates `secret` against the form's current secret
- Deduplicates by `submissionId`
- Inserts valid responses into the responses table
- Returns `{ ok: true, imported: N, duplicates: M }`

### 3. QR code in share modal

No changes needed. The existing QR code contains `{origin}/f/{formId}`. The mobile app extracts `formId` and constructs the export URL.

---

## Project Structure

```
packages/
└── mobile/
    ├── app/
    │   ├── _layout.tsx
    │   ├── (tabs)/
    │   │   ├── _layout.tsx
    │   │   ├── forms.tsx
    │   │   ├── scan.tsx
    │   │   └── settings.tsx
    │   └── form/[id].tsx
    ├── src/
    │   ├── db/
    │   │   └── database.ts
    │   ├── api/
    │   │   └── server.ts
    │   ├── sync/
    │   │   └── engine.ts
    │   ├── renderer/
    │   │   ├── FormRenderer.tsx
    │   │   ├── ProgressBar.tsx
    │   │   ├── Description.tsx
    │   │   └── fields/
    │   │       ├── TextField.tsx
    │   │       ├── EmailField.tsx
    │   │       ├── NumberField.tsx
    │   │       ├── LongTextField.tsx
    │   │       ├── DropdownField.tsx
    │   │       ├── SingleChoiceField.tsx
    │   │       ├── MultiChoiceField.tsx
    │   │       ├── DateField.tsx
    │   │       ├── FileField.tsx
    │   │       └── RatingField.tsx
    │   ├── hooks/
    │   │   ├── useDatabase.ts
    │   │   ├── useSync.ts
    │   │   └── useConnectivity.ts
    │   ├── store.ts
    │   └── types.ts
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "expo-sqlite": "~15.0.0",
  "expo-camera": "~16.0.0",
  "expo-image-picker": "~16.0.0",
  "expo-file-system": "~18.0.0",
  "react-native-render-html": "^6.3.4",
  "@react-native-community/netinfo": "11.4.0",
  "zustand": "^4.5.0",
  "react-native": "0.76.0"
}
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| No internet on import scan | Show error: "Cannot reach server. Check your connection and server URL." |
| Form already imported | Dialog: "This form is already imported. Update config?" |
| Server URL malformed | Show inline error in settings + don't attempt sync |
| Sync interrupted (app killed) | On next launch, `synced=0` items remain → auto-sync triggers |
| Duplicate submission IDs on sync | Server returns duplicates in response, app marks them synced anyway |
| Config version changed (re-export) | App continues using imported version. User re-scans to update. |
| Camera permission denied | Show settings link to enable camera |
| Field type not recognized | Skip the field, log warning |
| Very large form (200 fields) | FlatList with virtualization, no issue |

---

## What's NOT in scope

- Background sync (iOS requires native background task registration)
- Push notifications for new configs
- Offline config editing (forms are serve-only on local)
- Multiple server URLs (one server at a time)
- Form deletion/purging on mobile (keep everything)
- Biometric lock for app access
