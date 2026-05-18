# FieldKit Mobile Client — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cross-platform (iOS + Android) Expo mobile app that imports form configs via QR scan, collects responses offline with native fields, and syncs to the online server when connected.

**Architecture:** Expo SDK 52 with Expo Router (tabs), SQLite for offline storage, NetInfo for connectivity detection, and native React Native form renderer matching FieldKit design system.

**Tech Stack:** Expo 52, React Native 0.76, Expo Router 4, Expo SQLite 15, Zustand, react-native-render-html, NetInfo

**Server changes:** Add `mobileSecret` to Prisma schema, embed secret in export endpoint, new `POST /api/mobile/responses` sync endpoint.

---

### Task 1: Add `mobileSecret` field to Prisma schema

**Files:**
- Modify: `apps/web/prisma/schema.prisma`

- [ ] **Step 1: Add the field to Form model**

After `closed Boolean @default(false)` on line 68, add:
```prisma
  mobileSecret String?
```

- [ ] **Step 2: Run Prisma migration**

```bash
cd apps/web && npx prisma migrate dev --name add_mobile_secret
```
Expected: Migration created successfully.

- [ ] **Step 3: Commit**

```bash
git add apps/web/prisma/schema.prisma apps/web/prisma/migrations/
git commit -m "feat: add mobileSecret field to Form model"
```

---

### Task 2: Embed secret in export endpoint

**Files:**
- Modify: `apps/web/src/app/api/forms/[id]/export/route.ts`
- Modify: `apps/web/src/lib/db.ts`

- [ ] **Step 1: Add secret generation + storage to export endpoint**

In the GET handler, after fetching the form and before returning, generate a secret if one doesn't exist, store it on the form, and include it in the config:

Add to imports:
```typescript
import { randomBytes } from 'crypto'
```

After line 124 (`if (!form) return ...`), add:
```typescript
  let secret = form.mobileSecret
  if (!secret) {
    secret = randomBytes(24).toString('base64url')
    await db.form.update({
      where: { id: form.id },
      data: { mobileSecret: secret },
    })
  }
```

Then in the config object (currently lines 129-137), add `secret`:
```typescript
  const config = {
    formId: form.id,
    ...(schema.fields !== undefined ? { fields: schema.fields } : {}),
    ...(schema.settings !== undefined ? { settings: schema.settings } : {}),
    title: form.title,
    description,
    version: form.version,
    secret,
    exportedAt: new Date().toISOString(),
  }
```

**Note:** If `form.mobileSecret` already exists, use it (so re-exporting keeps the same secret). If we wanted a new secret on re-export, we'd generate unconditionally — but keeping it consistent means already-imported mobile clients can still sync after the user re-exports for someone else.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/forms/[id]/export/route.ts
git commit -m "feat: embed mobileSecret in exported form config"
```

---

### Task 3: Create mobile response sync endpoint

**Files:**
- Create: `apps/web/src/app/api/mobile/responses/route.ts`

- [ ] **Step 1: Write the endpoint**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MobileResponse {
  submissionId: string
  submittedAt: string
  source?: string
  answers: { fieldId: string; value: unknown }[]
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { formId, secret, responses } = (body ?? {}) as {
    formId?: string
    secret?: string
    responses?: MobileResponse[]
  }

  if (!formId || !secret || !Array.isArray(responses) || responses.length === 0) {
    return NextResponse.json({ error: 'Missing formId, secret, or responses' }, { status: 400 })
  }

  const form = await db.form.findFirst({ where: { id: formId } })
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  if (!form.mobileSecret || form.mobileSecret !== secret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  let imported = 0
  let duplicates = 0

  for (const r of responses) {
    if (!r.submissionId || !Array.isArray(r.answers)) continue

    const existing = await db.response.findFirst({
      where: { submissionId: r.submissionId },
    })
    if (existing) {
      duplicates++
      continue
    }

    await db.response.create({
      data: {
        formId,
        submissionId: r.submissionId,
        source: r.source ?? 'mobile',
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
        data: { answers: r.answers },
      },
    })
    imported++
  }

  return NextResponse.json({ ok: true, imported, duplicates })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/api/mobile/responses/route.ts
git commit -m "feat: add mobile response sync endpoint"
```

---

### Task 4: Initialize Expo mobile project in monorepo

**Files:**
- Create: `packages/mobile/` (entire Expo project)

- [ ] **Step 1: Create the Expo project**

```bash
cd packages
npx create-expo-app@latest mobile --template tabs -- --npm
```
This creates `packages/mobile/` with Expo Router tab structure.

- [ ] **Step 2: Install additional dependencies**

```bash
cd packages/mobile
npx expo install expo-sqlite expo-camera expo-image-picker expo-file-system
npx expo install @react-native-community/netinfo react-native-render-html
npm install zustand uuid
npm install -D @types/uuid
```

- [ ] **Step 3: Clean up template and create directory structure**

Remove template screens:
```bash
rm -rf app/(tabs)/index.tsx app/(tabs)/explore.tsx app/+not-found.tsx
```

Create directories:
```bash
mkdir -p src/db src/api src/sync src/renderer/fields src/hooks
```

- [ ] **Step 4: Create shared types file**

Create `packages/mobile/src/types.ts`:
```typescript
export interface FieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  maxSelections?: number
  minDate?: string
  maxDate?: string
}

export interface FieldConfig {
  id: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' |
        'radio' | 'checkbox' | 'date' | 'file' | 'rating'
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: string[]
  validation?: FieldValidation
  acceptedTypes?: string[]
  maxSize?: number
}

export interface FormSettings {
  submitButtonText?: string
  confirmationMessage?: string
  allowMultipleSubmissions?: boolean
}

export interface FormConfig {
  formId: string
  title: string
  description: string
  fields: FieldConfig[]
  settings: FormSettings
  version: number
  secret: string
  exportedAt: string
}

export interface FormRecord {
  id: string
  title: string
  description: string
  configJson: string
  secret: string
  importedAt: number
  lastSyncedAt: number | null
}

export interface ResponseAnswer {
  fieldId: string
  value: unknown
}

export interface ResponseRecord {
  id: string
  formId: string
  submissionId: string
  dataJson: string
  submittedAt: number
  synced: 0 | 1
}

export interface SyncResult {
  ok: boolean
  imported?: number
  duplicates?: number
  error?: string
}
```

- [ ] **Step 5: Verify the project can start**

```bash
cd packages/mobile && npx expo start --web 2>&1 | head -5
```
(Terminate after confirming it starts without error, or just check that `npx tsc --noEmit` passes.)

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors (template code removed, may have unused imports — fix or proceed).

- [ ] **Step 6: Commit**

```bash
git add packages/mobile/
git commit -m "feat: initialize Expo mobile project with types"
```

---

### Task 5: Set up SQLite database layer

**Files:**
- Create: `packages/mobile/src/db/database.ts`

- [ ] **Step 1: Create the database module**

Create `packages/mobile/src/db/database.ts`:
```typescript
import * as SQLite from 'expo-sqlite'
import { FormRecord, ResponseRecord } from '../types'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('fieldkit.db')
  await db.execAsync(`PRAGMA journal_mode = WAL;`)
  await db.execAsync(`
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
      form_id TEXT NOT NULL,
      submission_id TEXT NOT NULL UNIQUE,
      data_json TEXT NOT NULL,
      submitted_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    );
  `)
  return db
}

export async function upsertForm(form: FormRecord): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    `INSERT OR REPLACE INTO forms (id, title, description, config_json, secret, imported_at, last_synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    form.id, form.title, form.description, form.configJson,
    form.secret, form.importedAt, form.lastSyncedAt ?? null
  )
}

export async function getAllForms(): Promise<FormRecord[]> {
  const d = await getDatabase()
  return d.getAllAsync<FormRecord>(
    'SELECT * FROM forms ORDER BY imported_at DESC'
  )
}

export async function getForm(id: string): Promise<FormRecord | null> {
  const d = await getDatabase()
  return d.getFirstAsync<FormRecord>(
    'SELECT * FROM forms WHERE id = ?', id
  )
}

export async function getFormResponseCount(formId: string): Promise<number> {
  const d = await getDatabase()
  const row = await d.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM responses WHERE form_id = ?', formId
  )
  return row?.count ?? 0
}

export async function insertResponse(
  id: string,
  formId: string,
  submissionId: string,
  dataJson: string,
  submittedAt: number
): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    `INSERT INTO responses (id, form_id, submission_id, data_json, submitted_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    id, formId, submissionId, dataJson, submittedAt
  )
}

export async function getUnsyncedResponses(): Promise<ResponseRecord[]> {
  const d = await getDatabase()
  return d.getAllAsync<ResponseRecord>(
    'SELECT * FROM responses WHERE synced = 0 ORDER BY submitted_at ASC'
  )
}

export async function markResponsesSynced(ids: string[]): Promise<void> {
  const d = await getDatabase()
  const placeholders = ids.map(() => '?').join(',')
  await d.runAsync(
    `UPDATE responses SET synced = 1 WHERE id IN (${placeholders})`,
    ...ids
  )
}

export async function updateFormLastSynced(formId: string, timestamp: number): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    'UPDATE forms SET last_synced_at = ? WHERE id = ?',
    timestamp, formId
  )
}

export async function deleteAllData(): Promise<void> {
  const d = await getDatabase()
  await d.runAsync('DELETE FROM responses')
  await d.runAsync('DELETE FROM forms')
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/src/db/database.ts
git commit -m "feat: add SQLite database layer for mobile app"
```

---

### Task 6: Create API client for server communication

**Files:**
- Create: `packages/mobile/src/api/server.ts`

- [ ] **Step 1: Create the API client**

Create `packages/mobile/src/api/server.ts`:
```typescript
import { FormConfig, SyncResult } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SERVER_URL_KEY = 'fieldkit_server_url'

export async function getServerUrl(): Promise<string> {
  const url = await AsyncStorage.getItem(SERVER_URL_KEY)
  return url ?? ''
}

export async function setServerUrl(url: string): Promise<void> {
  const trimmed = url.replace(/\/+$/, '')
  await AsyncStorage.setItem(SERVER_URL_KEY, trimmed)
}

export async function fetchFormConfig(formId: string, serverUrl?: string): Promise<FormConfig> {
  const base = (serverUrl ?? await getServerUrl()).replace(/\/+$/, '')
  if (!base) throw new Error('Server URL not configured')

  const res = await fetch(`${base}/api/forms/${formId}/export`)
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`)
  return res.json()
}

export async function syncResponses(
  formId: string,
  secret: string,
  responses: { submissionId: string; submittedAt: string; answers: { fieldId: string; value: unknown }[] }[],
  serverUrl?: string
): Promise<SyncResult> {
  const base = (serverUrl ?? await getServerUrl()).replace(/\/+$/, '')
  if (!base) throw new Error('Server URL not configured')

  const res = await fetch(`${base}/api/mobile/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formId, secret, responses }),
  })
  return res.json()
}
```

Note: Needs `@react-native-async-storage/async-storage`. Install it:
```bash
cd packages/mobile && npx expo install @react-native-async-storage/async-storage
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/src/api/server.ts packages/mobile/package.json
git commit -m "feat: add server API client for mobile app"
```

---

### Task 7: Create Zustand store and connectivity hook

**Files:**
- Create: `packages/mobile/src/store.ts`
- Create: `packages/mobile/src/hooks/useConnectivity.ts`

- [ ] **Step 1: Create the app store**

Create `packages/mobile/src/store.ts`:
```typescript
import { create } from 'zustand'
import { FormRecord } from './types'

interface AppState {
  forms: FormRecord[]
  isOnline: boolean
  isSyncing: boolean
  lastSynced: number | null
  serverUrl: string

  setForms: (forms: FormRecord[]) => void
  addForm: (form: FormRecord) => void
  setOnline: (online: boolean) => void
  setSyncing: (syncing: boolean) => void
  setLastSynced: (ts: number) => void
  setServerUrl: (url: string) => void
}

export const useStore = create<AppState>((set) => ({
  forms: [],
  isOnline: true,
  isSyncing: false,
  lastSynced: null,
  serverUrl: '',

  setForms: (forms) => set({ forms }),
  addForm: (form) => set((s) => ({ forms: [...s.forms, form] })),
  setOnline: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  setLastSynced: (lastSynced) => set({ lastSynced }),
  setServerUrl: (serverUrl) => set({ serverUrl }),
}))
```

- [ ] **Step 2: Create the connectivity hook**

Create `packages/mobile/src/hooks/useConnectivity.ts`:
```typescript
import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useStore } from '../store'

export function useConnectivity() {
  const setOnline = useStore((s) => s.setOnline)

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected)
    })
    return () => unsub()
  }, [setOnline])
}
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/mobile/src/store.ts packages/mobile/src/hooks/useConnectivity.ts
git commit -m "feat: add Zustand store and connectivity hook"
```

---

### Task 8: Create tab navigator layout

**Files:**
- Modify: `packages/mobile/app/_layout.tsx`
- Create: `packages/mobile/app/(tabs)/_layout.tsx`

- [ ] **Step 1: Write root layout**

Replace `packages/mobile/app/_layout.tsx`:
```typescript
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useConnectivity } from '../src/hooks/useConnectivity'

export default function RootLayout() {
  useConnectivity()

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="form/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  )
}
```

- [ ] **Step 2: Write tab layout**

Create `packages/mobile/app/(tabs)/_layout.tsx`:
```typescript
import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useStore } from '../../src/store'

function ConnectionBanner() {
  const isOnline = useStore((s) => s.isOnline)
  return (
    <View style={[styles.banner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={isOnline ? styles.bannerTextOnline : styles.bannerTextOffline}>
        {isOnline ? 'Connected to server' : 'Offline — responses saved locally'}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <>
      <ConnectionBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#a3a3a3',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            backgroundColor: '#fff',
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500' as const },
        }}
      >
        <Tabs.Screen
          name="forms"
          options={{
            title: 'Forms',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'📋'}</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'📷'}</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'⚙'}</Text>
            ),
          }}
        />
      </Tabs>
    </>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bannerOnline: { backgroundColor: '#f0fdf4' },
  bannerOffline: { backgroundColor: '#fefce8' },
  bannerTextOnline: { fontSize: 12, fontWeight: '500', color: '#166534' },
  bannerTextOffline: { fontSize: 12, fontWeight: '500', color: '#854d0e' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOnline: { backgroundColor: '#22c55e' },
  dotOffline: { backgroundColor: '#f59e0b' },
})
```

- [ ] **Step 3: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add packages/mobile/app/_layout.tsx packages/mobile/app/(tabs)/_layout.tsx
git commit -m "feat: add tab navigator layout with connection banner"
```

---

### Task 9: Forms list screen

**Files:**
- Create: `packages/mobile/app/(tabs)/forms.tsx`

- [ ] **Step 1: Write the forms list screen**

Create `packages/mobile/app/(tabs)/forms.tsx`:
```typescript
import { useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../src/store'
import { getAllForms, getFormResponseCount } from '../../src/db/database'
import { getServerUrl } from '../../src/api/server'
import { syncAll } from '../../src/sync/engine'
import { FormRecord } from '../../src/types'

export default function FormsList() {
  const router = useRouter()
  const forms = useStore((s) => s.forms)
  const setForms = useStore((s) => s.setForms)
  const isOnline = useStore((s) => s.isOnline)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)
  const lastSynced = useStore((s) => s.lastSynced)
  const setLastSynced = useStore((s) => s.setLastSynced)

  const loadForms = useCallback(async () => {
    const result = await getAllForms()
    setForms(result)
  }, [setForms])

  useEffect(() => {
    loadForms()
  }, [loadForms])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncAll()
      setLastSynced(Date.now())
    } finally {
      setSyncing(false)
    }
  }

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never'
    const diff = Math.floor((Date.now() - lastSynced) / 60000)
    if (diff < 1) return 'Just now'
    if (diff === 1) return '1 min ago'
    return `${diff} min ago`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Forms</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanBtnText}>QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.syncBar}>
        <Text style={styles.syncInfo}>Last synced {formatLastSynced()}</Text>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSync}
          disabled={isSyncing || !isOnline}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {forms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No forms yet</Text>
          <Text style={styles.emptyDesc}>Scan a QR code to import a form</Text>
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadForms} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/form/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <SyncBadge form={item} />
              </View>
              <FormMeta form={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

function SyncBadge({ form }: { form: FormRecord }) {
  if (form.lastSyncedAt) {
    return (
      <View style={[styles.badge, styles.badgeSynced]}>
        <Text style={styles.badgeTextSynced}>{'Synced'}</Text>
      </View>
    )
  }
  // Check pending count asynchronously would require state; simplify:
  return (
    <View style={[styles.badge, styles.badgeNew]}>
      <Text style={styles.badgeTextNew}>New</Text>
    </View>
  )
}

function FormMeta({ form }: { form: FormRecord }) {
  let config: { fields?: unknown[] } = {}
  try { config = JSON.parse(form.configJson) } catch {}

  return (
    <View style={styles.cardMeta}>
      <Text style={styles.metaText}>{Array.isArray(config.fields) ? config.fields.length : 0} fields</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000' },
  scanBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  scanBtnText: { fontSize: 16, fontWeight: '600', color: '#000' },
  syncBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16,
  },
  syncInfo: { fontSize: 13, color: '#737373' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999,
    backgroundColor: '#000',
  },
  syncBtnText: { fontSize: 13, fontWeight: '500', color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5',
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#000', flex: 1 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 13, color: '#737373' },
  badge: {
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 9999,
    marginLeft: 12,
  },
  badgeSynced: { backgroundColor: '#f0fdf4' },
  badgeNew: { backgroundColor: '#fafafa' },
  badgeTextSynced: { fontSize: 11, fontWeight: '500', color: '#166534' },
  badgeTextNew: { fontSize: 11, fontWeight: '500', color: '#737373' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#737373', textAlign: 'center', lineHeight: 22 },
})
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/app/(tabs)/forms.tsx
git commit -m "feat: add forms list screen"
```

---

### Task 10: Scan screen (QR import)

**Files:**
- Create: `packages/mobile/app/(tabs)/scan.tsx`

- [ ] **Step 1: Write the scan screen**

Create `packages/mobile/app/(tabs)/scan.tsx`:
```typescript
import { useState } from 'react'
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useStore } from '../../src/store'
import { upsertForm, getForm } from '../../src/db/database'
import { fetchFormConfig, getServerUrl, setServerUrl } from '../../src/api/server'
import { FormRecord } from '../../src/types'

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const router = useRouter()
  const addForm = useStore((s) => s.addForm)
  const setServerUrlStore = useStore((s) => s.setServerUrl)
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) return <View style={styles.container} />
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionDesc}>Allow camera to scan QR codes</Text>
        <Text style={styles.permissionLink} onPress={requestPermission}>
          Grant Permission
        </Text>
      </View>
    )
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanning || importing) return
    setScanning(true)

    try {
      const match = data.match(/\/f\/([a-zA-Z0-9_-]+)/)
      if (!match) {
        Alert.alert('Invalid QR', 'This QR code does not contain a valid form link.')
        setScanning(false)
        return
      }

      const formId = match[1]
      const existing = await getForm(formId)
      if (existing) {
        Alert.alert(
          'Already imported',
          'This form is already imported. Do you want to update it?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanning(false) },
            { text: 'Update', onPress: () => importForm(formId, data) },
          ]
        )
        return
      }

      await importForm(formId, data)
    } catch {
      Alert.alert('Error', 'Failed to scan QR code.')
      setScanning(false)
    }
  }

  const importForm = async (formId: string, qrData: string) => {
    setImporting(true)

    try {
      const qrOrigin = qrData.match(/^(https?:\/\/[^/]+)/)?.[1]
      let serverUrl = await getServerUrl()
      if (!serverUrl && qrOrigin) {
        serverUrl = qrOrigin
        await setServerUrl(serverUrl)
        setServerUrlStore(serverUrl)
      }
      if (!serverUrl) {
        Alert.alert('Server not configured', 'Set the server URL in Settings first.')
        return
      }

      const config = await fetchFormConfig(formId, serverUrl)
      const now = Date.now()
      const record: FormRecord = {
        id: config.formId,
        title: config.title,
        description: config.description,
        configJson: JSON.stringify(config),
        secret: config.secret,
        importedAt: now,
        lastSyncedAt: null,
      }

      await upsertForm(record)
      addForm(record)
      Alert.alert('Imported', `"${config.title}" is ready to fill.`, [
        { text: 'OK', onPress: () => router.push('/forms') },
      ])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Import failed', msg)
    } finally {
      setScanning(false)
      setImporting(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.cornerTop} />
        <View style={styles.cornerBottom} />
      </View>
      <View style={styles.footer}>
        {importing ? (
          <View style={styles.importingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.importingText}>Importing form...</Text>
          </View>
        ) : (
          <Text style={styles.footerText}>Point camera at a form QR code</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 40,
  },
  permissionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  permissionDesc: { fontSize: 14, color: '#737373', marginBottom: 16 },
  permissionLink: { fontSize: 14, color: '#000', fontWeight: '500' },
  overlay: {
    position: 'absolute', top: '30%', left: '12%', right: '12%',
    aspectRatio: 1, justifyContent: 'space-between',
  },
  cornerTop: {
    width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3,
    borderColor: '#fff', borderRadius: 4,
  },
  cornerBottom: {
    width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: '#fff', borderRadius: 4, alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center',
  },
  footerText: { color: '#fff', fontSize: 14 },
  importingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  importingText: { color: '#fff', fontSize: 14 },
})
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/app/(tabs)/scan.tsx
git commit -m "feat: add QR scan screen for form import"
```

---

### Task 11: Settings screen

**Files:**
- Create: `packages/mobile/app/(tabs)/settings.tsx`

- [ ] **Step 1: Write the settings screen**

Create `packages/mobile/app/(tabs)/settings.tsx`:
```typescript
import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native'
import { useStore } from '../../src/store'
import { getServerUrl, setServerUrl } from '../../src/api/server'
import { syncAll } from '../../src/sync/engine'
import { deleteAllData } from '../../src/db/database'

export default function Settings() {
  const [url, setUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const isOnline = useStore((s) => s.isOnline)
  const setServerUrlStore = useStore((s) => s.setServerUrl)

  useEffect(() => {
    getServerUrl().then(setUrl)
  }, [])

  const handleSaveUrl = async () => {
    await setServerUrl(url)
    setServerUrlStore(url)
    Alert.alert('Saved', 'Server URL saved.')
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      await syncAll()
      Alert.alert('Done', 'All responses synced.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Error', msg)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all data',
      'This will remove all forms and responses. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteAllData()
            Alert.alert('Done', 'All data deleted.')
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://fieldkit.app"
          placeholderTextColor="#a3a3a3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSaveUrl}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSyncAll}
          disabled={syncing || !isOnline}
        >
          <Text style={[styles.btnText, styles.btnPrimaryText]}>
            {syncing ? 'Syncing...' : 'Sync All Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.version}>FieldKit Mobile v1.0.0</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.btnDestructive} onPress={handleDeleteAll}>
          <Text style={styles.btnDestructiveText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 34, fontWeight: '700', color: '#000', marginBottom: 32 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: '#000', marginBottom: 12,
  },
  btn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 12, alignItems: 'center',
  },
  btnText: { fontSize: 14, fontWeight: '500', color: '#000' },
  btnPrimary: { backgroundColor: '#000', borderColor: '#000' },
  btnPrimaryText: { color: '#fff' },
  version: { fontSize: 13, color: '#a3a3a3', textAlign: 'center' },
  btnDestructive: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 12, alignItems: 'center',
  },
  btnDestructiveText: { fontSize: 14, fontWeight: '500', color: '#dc2626' },
})
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/app/(tabs)/settings.tsx
git commit -m "feat: add settings screen"
```

---

### Task 12: Text field components (text, email, number, textarea)

**Files:**
- Create: `packages/mobile/src/renderer/fields/TextField.tsx`
- Create: `packages/mobile/src/renderer/fields/EmailField.tsx`
- Create: `packages/mobile/src/renderer/fields/NumberField.tsx`
- Create: `packages/mobile/src/renderer/fields/LongTextField.tsx`

- [ ] **Step 1: Create shared field wrapper component**

Create `packages/mobile/src/renderer/fields/FieldWrapper.tsx`:
```typescript
import { View, Text, StyleSheet, TextInput } from 'react-native'
import { ReactNode } from 'react'

interface FieldWrapperProps {
  label: string
  helpText?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FieldWrapper({ label, helpText, error, required, children }: FieldWrapperProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
      {helpText && !error ? <Text style={styles.help}>{helpText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '500', color: '#000', marginBottom: 6 },
  help: { fontSize: 13, color: '#737373', marginTop: 4 },
  error: { fontSize: 13, color: '#dc2626', marginTop: 4 },
})
```

- [ ] **Step 2: Create TextField**

Create `packages/mobile/src/renderer/fields/TextField.tsx`:
```typescript
import { TextInput, StyleSheet } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function TextField({ field, value, error, onChange, onBlur }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        placeholderTextColor="#a3a3a3"
        maxLength={field.validation?.maxLength}
      />
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#000', minHeight: 48,
  },
  inputError: { borderColor: '#dc2626' },
})
```

- [ ] **Step 3: Create EmailField**

Create `packages/mobile/src/renderer/fields/EmailField.tsx`:
```typescript
import { TextInput, StyleSheet } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function EmailField({ field, value, error, onChange, onBlur }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={field.placeholder ?? 'email@example.com'}
        placeholderTextColor="#a3a3a3"
        keyboardType="email-address"
        autoCapitalize="none"
      />
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#000', minHeight: 48,
  },
  inputError: { borderColor: '#dc2626' },
})
```

- [ ] **Step 4: Create NumberField**

Create `packages/mobile/src/renderer/fields/NumberField.tsx`:
```typescript
import { TextInput, StyleSheet } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function NumberField({ field, value, error, onChange, onBlur }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9.-]/g, ''))}
        onBlur={onBlur}
        placeholder={field.placeholder}
        placeholderTextColor="#a3a3a3"
        keyboardType="numeric"
      />
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#000', minHeight: 48,
  },
  inputError: { borderColor: '#dc2626' },
})
```

- [ ] **Step 5: Create LongTextField**

Create `packages/mobile/src/renderer/fields/LongTextField.tsx`:
```typescript
import { TextInput, StyleSheet } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function LongTextField({ field, value, error, onChange, onBlur }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        placeholderTextColor="#a3a3a3"
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        maxLength={field.validation?.maxLength}
      />
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#000', minHeight: 100,
  },
  inputError: { borderColor: '#dc2626' },
})
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 7: Commit**

```bash
git add packages/mobile/src/renderer/fields/
git commit -m "feat: add text/email/number/textarea field components"
```

---

### Task 13: Choice field components (select, radio, checkbox)

**Files:**
- Create: `packages/mobile/src/renderer/fields/DropdownField.tsx`
- Create: `packages/mobile/src/renderer/fields/SingleChoiceField.tsx`
- Create: `packages/mobile/src/renderer/fields/MultiChoiceField.tsx`

- [ ] **Step 1: Create DropdownField**

Create `packages/mobile/src/renderer/fields/DropdownField.tsx`:
```typescript
import { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet, View, Modal, FlatList } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function DropdownField({ field, value, error, onChange, onBlur }: Props) {
  const [open, setOpen] = useState(false)
  const options = field.options ?? []

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || field.placeholder || 'Select...'}
        </Text>
        <Text style={styles.arrow}>{'    ▼'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => { setOpen(false); onBlur() }}>
        <TouchableOpacity style={styles.backdrop} onPress={() => { setOpen(false); onBlur() }}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{field.label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionSelected]}
                  onPress={() => { onChange(item); setOpen(false); onBlur() }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  triggerError: { borderColor: '#dc2626' },
  triggerText: { fontSize: 15, color: '#000', flex: 1 },
  triggerPlaceholder: { fontSize: 15, color: '#a3a3a3', flex: 1 },
  arrow: { fontSize: 12, color: '#737373' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    maxHeight: '60%', paddingTop: 20, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: '#000', textAlign: 'center', marginBottom: 16 },
  option: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  optionSelected: { backgroundColor: '#fafafa' },
  optionText: { fontSize: 15, color: '#000' },
  optionTextSelected: { fontWeight: '600' },
})
```

- [ ] **Step 2: Create SingleChoiceField**

Create `packages/mobile/src/renderer/fields/SingleChoiceField.tsx`:
```typescript
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function SingleChoiceField({ field, value, error, onChange }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <View style={styles.list}>
        {(field.options ?? []).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.row, value === opt && styles.rowSelected]}
            onPress={() => onChange(value === opt ? '' : opt)}
          >
            <View style={[styles.radio, value === opt && styles.radioSelected]}>
              {value === opt && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.rowText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  rowSelected: { borderColor: '#000' },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: '#000' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' },
  rowText: { fontSize: 15, color: '#000', flex: 1 },
})
```

- [ ] **Step 3: Create MultiChoiceField**

Create `packages/mobile/src/renderer/fields/MultiChoiceField.tsx`:
```typescript
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string[]
  error?: string
  onChange: (val: string[]) => void
  onBlur: () => void
}

export function MultiChoiceField({ field, value, error, onChange }: Props) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      const max = field.validation?.maxSelections
      if (max && value.length >= max) return
      onChange([...value, opt])
    }
  }

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <Text style={styles.hint}>
        {field.validation?.maxSelections ? `Select up to ${field.validation.maxSelections}` : 'Select all that apply'}
      </Text>
      <View style={styles.list}>
        {(field.options ?? []).map((opt) => {
          const selected = value.includes(opt)
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => toggle(opt)}
            >
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>{'✓'}</Text>}
              </View>
              <Text style={styles.rowText}>{opt}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, color: '#a3a3a3', marginBottom: 8 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  rowSelected: { borderColor: '#000' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { borderColor: '#000', backgroundColor: '#000' },
  checkmark: { fontSize: 12, color: '#fff', fontWeight: '700' },
  rowText: { fontSize: 15, color: '#000', flex: 1 },
})
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/mobile/src/renderer/fields/DropdownField.tsx packages/mobile/src/renderer/fields/SingleChoiceField.tsx packages/mobile/src/renderer/fields/MultiChoiceField.tsx
git commit -m "feat: add dropdown/radio/checkbox field components"
```

---

### Task 14: Date, file, and rating field components

**Files:**
- Create: `packages/mobile/src/renderer/fields/DateField.tsx`
- Create: `packages/mobile/src/renderer/fields/FileField.tsx`
- Create: `packages/mobile/src/renderer/fields/RatingField.tsx`

- [ ] **Step 1: Create DateField**

Create `packages/mobile/src/renderer/fields/DateField.tsx`:
```typescript
import { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function DateField({ field, value, error, onChange }: Props) {
  const [show, setShow] = useState(false)

  const minDate = field.validation?.minDate ? new Date(field.validation.minDate) : undefined
  const maxDate = field.validation?.maxDate ? new Date(field.validation.maxDate) : undefined

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setShow(true)}
      >
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || 'Select date...'}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(_e, d) => {
            setShow(false)
            if (d) onChange(d.toISOString().split('T')[0])
          }}
        />
      )}
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
    justifyContent: 'center',
  },
  triggerError: { borderColor: '#dc2626' },
  triggerText: { fontSize: 15, color: '#000' },
  triggerPlaceholder: { fontSize: 15, color: '#a3a3a3' },
})
```

- [ ] **Step 2: Create FileField**

Create `packages/mobile/src/renderer/fields/FileField.tsx`:
```typescript
import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function FileField({ field, value, error, onChange }: Props) {
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri)
    }
  }

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      {value ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: value }} style={styles.preview} />
          <TouchableOpacity onPress={pick} style={styles.changeBtn}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.dropZone} onPress={pick}>
          <Text style={styles.dropText}>Tap to select image</Text>
          <Text style={styles.dropHint}>JPG, PNG, WebP, GIF up to 10MB</Text>
        </TouchableOpacity>
      )}
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingVertical: 32, alignItems: 'center', borderStyle: 'dashed',
  },
  dropText: { fontSize: 14, color: '#737373', marginBottom: 4 },
  dropHint: { fontSize: 12, color: '#a3a3a3' },
  previewWrap: { gap: 8 },
  preview: {
    width: '100%', height: 160, borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e5e5',
  },
  changeBtn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 8, alignItems: 'center',
  },
  changeText: { fontSize: 13, color: '#000', fontWeight: '500' },
})
```

- [ ] **Step 3: Create RatingField**

Create `packages/mobile/src/renderer/fields/RatingField.tsx`:
```typescript
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: number
  error?: string
  onChange: (val: number) => void
  onBlur: () => void
}

export function RatingField({ field, value, error, onChange }: Props) {
  const max = field.validation?.max ?? 5

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <View style={styles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value ? styles.starFilled : styles.starEmpty]}>
              {'★'}
            </Text>
          </TouchableOpacity>
        ))}
        {value > 0 && <Text style={styles.count}>{value}/{max}</Text>}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 28 },
  starFilled: { color: '#000' },
  starEmpty: { color: '#e5e5e5' },
  count: { fontSize: 14, color: '#737373', marginLeft: 8 },
})
```

Note: Need to install `@react-native-community/datetimepicker`:
```bash
cd packages/mobile && npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/mobile/src/renderer/fields/DateField.tsx packages/mobile/src/renderer/fields/FileField.tsx packages/mobile/src/renderer/fields/RatingField.tsx packages/mobile/package.json
git commit -m "feat: add date/file/rating field components"
```

---

### Task 15: Form renderer container, progress bar, description

**Files:**
- Create: `packages/mobile/src/renderer/FormRenderer.tsx`
- Create: `packages/mobile/src/renderer/ProgressBar.tsx`
- Create: `packages/mobile/src/renderer/Description.tsx`

- [ ] **Step 1: Create ProgressBar**

Create `packages/mobile/src/renderer/ProgressBar.tsx`:
```typescript
import { View, StyleSheet } from 'react-native'

interface Props {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: Props) {
  const pct = total > 0 ? completed / total : 0
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(pct * 100, 100)}%` as unknown as number }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 3, backgroundColor: '#e5e5e5', borderRadius: 2, overflow: 'hidden',
  },
  fill: {
    height: '100%', backgroundColor: '#000', borderRadius: 2,
  },
})
```

- [ ] **Step 2: Create Description component**

Create `packages/mobile/src/renderer/Description.tsx`:
```typescript
import { StyleSheet } from 'react-native'
import RenderHtml from 'react-native-render-html'
import { useWindowDimensions } from 'react-native'

interface Props {
  html: string
}

export function Description({ html }: Props) {
  const { width } = useWindowDimensions()

  if (!html) return null

  return (
    <RenderHtml
      contentWidth={width - 40}
      source={{ html }}
      baseStyle={styles.base}
      tagsStyles={{
        p: { marginBottom: 8 },
        strong: { fontWeight: '600' },
        em: { fontStyle: 'italic' },
        u: { textDecorationLine: 'underline' },
        a: { color: '#000', textDecorationLine: 'underline' },
      }}
    />
  )
}

const styles = StyleSheet.create({
  base: { fontSize: 15, color: '#737373', lineHeight: 22 },
})
```

- [ ] **Step 3: Create FormRenderer**

Create `packages/mobile/src/renderer/FormRenderer.tsx`:
```typescript
import { useState, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { TextField } from './fields/TextField'
import { EmailField } from './fields/EmailField'
import { NumberField } from './fields/NumberField'
import { LongTextField } from './fields/LongTextField'
import { DropdownField } from './fields/DropdownField'
import { SingleChoiceField } from './fields/SingleChoiceField'
import { MultiChoiceField } from './fields/MultiChoiceField'
import { DateField } from './fields/DateField'
import { FileField } from './fields/FileField'
import { RatingField } from './fields/RatingField'
import { ProgressBar } from './ProgressBar'
import { Description } from './Description'
import { FieldConfig, FormConfig } from '../types'

interface Props {
  config: FormConfig
  onSubmit: (answers: { fieldId: string; value: unknown }[]) => void
}

type FieldValue = string | string[] | number

export function FormRenderer({ config, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = useCallback((fieldId: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleBlur = useCallback((fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }))
    const field = config.fields.find((f) => f.id === fieldId)
    if (field) {
      const err = validateField(field, values[fieldId] ?? '')
      setErrors((prev) => {
        const next = { ...prev }
        if (err) next[fieldId] = err
        else delete next[fieldId]
        return next
      })
    }
  }, [config.fields, values])

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    for (const field of config.fields) {
      const err = validateField(field, values[field.id] ?? '')
      if (err) newErrors[field.id] = err
    }
    setErrors(newErrors)
    setTouched(() => {
      const all: Record<string, boolean> = {}
      config.fields.forEach((f) => { all[f.id] = true })
      return all
    })
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateAll()) return

    const answers = config.fields.map((f) => ({
      fieldId: f.id,
      value: values[f.id] ?? '',
    }))
    onSubmit(answers)
  }

  const completed = config.fields.filter((f) => {
    const v = values[f.id]
    if (v === undefined || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  }).length

  const renderField = (field: FieldConfig) => {
    const props = {
      field,
      value: values[field.id] ?? (field.type === 'checkbox' ? [] : field.type === 'rating' ? 0 : ''),
      error: touched[field.id] ? errors[field.id] : undefined,
      onChange: (val: FieldValue) => handleChange(field.id, val),
      onBlur: () => handleBlur(field.id),
      key: field.id,
    }

    switch (field.type) {
      case 'text': return <TextField {...props} value={values[field.id] as string ?? ''} />
      case 'email': return <EmailField {...props} value={values[field.id] as string ?? ''} />
      case 'number': return <NumberField {...props} value={values[field.id] as string ?? ''} />
      case 'textarea': return <LongTextField {...props} value={values[field.id] as string ?? ''} />
      case 'select': return <DropdownField {...props} value={values[field.id] as string ?? ''} />
      case 'radio': return <SingleChoiceField {...props} value={values[field.id] as string ?? ''} />
      case 'checkbox': return <MultiChoiceField {...props} value={values[field.id] as string[] ?? []} onChange={(val: string[]) => handleChange(field.id, val)} />
      case 'date': return <DateField {...props} value={values[field.id] as string ?? ''} />
      case 'file': return <FileField {...props} value={values[field.id] as string ?? ''} />
      case 'rating': return <RatingField {...props} value={values[field.id] as number ?? 0} onChange={(val: number) => handleChange(field.id, val)} />
      default: return null
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{config.title}</Text>
      <Description html={config.description} />
      {config.fields.map(renderField)}
      <View style={styles.progressWrap}>
        <ProgressBar completed={completed} total={config.fields.length} />
        <Text style={styles.progressText}>{completed}/{config.fields.length}</Text>
      </View>
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {config.settings?.submitButtonText ?? 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function validateField(field: FieldConfig, value: FieldValue): string | null {
  if (field.required) {
    if (value === '' || value === undefined || value === null) return 'This field is required'
    if (Array.isArray(value) && value.length === 0) return 'This field is required'
    if (typeof value === 'number' && value === 0) return 'This field is required'
  }

  if (typeof value === 'string' && value !== '') {
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `Minimum ${field.validation.minLength} characters`
    }
    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `Maximum ${field.validation.maxLength} characters`
    }
    if (field.validation?.pattern) {
      try {
        if (!new RegExp(field.validation.pattern).test(value)) {
          return 'Invalid format'
        }
      } catch {}
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address'
    }
    if (field.type === 'number' && value) {
      const n = parseFloat(value)
      if (isNaN(n)) return 'Must be a number'
      if (field.validation?.min !== undefined && n < field.validation.min) {
        return `Minimum value: ${field.validation.min}`
      }
      if (field.validation?.max !== undefined && n > field.validation.max) {
        return `Maximum value: ${field.validation.max}`
      }
    }
  }

  return null
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8 },
  progressWrap: {
    marginTop: 8, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  progressText: {
    fontSize: 12, color: '#737373', fontFamily: 'monospace',
  },
  submit: {
    backgroundColor: '#000', borderRadius: 9999,
    paddingVertical: 16, alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
})
```

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/mobile/src/renderer/FormRenderer.tsx packages/mobile/src/renderer/ProgressBar.tsx packages/mobile/src/renderer/Description.tsx
git commit -m "feat: add form renderer container with progress bar and description"
```

---

### Task 16: Form fill screen with submission

**Files:**
- Create: `packages/mobile/app/form/[id].tsx`

- [ ] **Step 1: Write the form fill screen**

Create `packages/mobile/app/form/[id].tsx`:
```typescript
import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FormRenderer } from '../../src/renderer/FormRenderer'
import { getForm, insertResponse } from '../../src/db/database'
import { FormConfig } from '../../src/types'

export default function FormFillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(false)

  useEffect(() => {
    if (!id) return
    getForm(id).then((form) => {
      if (!form) {
        Alert.alert('Error', 'Form not found')
        router.back()
        return
      }
      const parsed = JSON.parse(form.configJson) as FormConfig
      setConfig(parsed)
      setConfirmMsg(parsed.settings?.confirmationMessage ?? 'Thank you for your response.')
      setAllowMultiple(parsed.settings?.allowMultipleSubmissions ?? false)
    })
  }, [id])

  const handleSubmit = async (answers: { fieldId: string; value: unknown }[]) => {
    if (!config) return

    const submissionId = generateId()
    const now = Date.now()

    await insertResponse(
      generateId(),
      config.formId,
      submissionId,
      JSON.stringify({ answers, source: 'mobile' }),
      now
    )

    setSubmitted(true)
  }

  const resetForm = () => setSubmitted(false)

  if (!config) return <View style={styles.container} />

  if (submitted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.checkIcon}>{'✓'}</Text>
        <Text style={styles.confirmTitle}>Response submitted</Text>
        <Text style={styles.confirmMsg}>{confirmMsg}</Text>
        {allowMultiple && (
          <TouchableOpacity style={styles.submitBtn} onPress={resetForm}>
            <Text style={styles.submitText}>Submit another response</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Back to forms</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FormRenderer config={config} onSubmit={handleSubmit} />
    </View>
  )
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 40,
  },
  checkIcon: {
    fontSize: 48, color: '#22c55e', marginBottom: 16,
    width: 64, height: 64, lineHeight: 64, textAlign: 'center',
    borderWidth: 2, borderColor: '#22c55e', borderRadius: 32,
    overflow: 'hidden',
  },
  confirmTitle: { fontSize: 22, fontWeight: '600', color: '#000', marginBottom: 8 },
  confirmMsg: { fontSize: 15, color: '#737373', marginBottom: 24, textAlign: 'center' },
  submitBtn: {
    backgroundColor: '#000', borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 28,
    marginBottom: 12,
  },
  submitText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  backBtn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  backText: { fontSize: 14, fontWeight: '500', color: '#000' },
})
```

- [ ] **Step 2: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add packages/mobile/app/form/[id].tsx
git commit -m "feat: add form fill screen with submission flow"
```

---

### Task 17: Sync engine

**Files:**
- Create: `packages/mobile/src/sync/engine.ts`
- Create: `packages/mobile/src/hooks/useSync.ts`

- [ ] **Step 1: Create sync engine**

Create `packages/mobile/src/sync/engine.ts`:
```typescript
import { getUnsyncedResponses, markResponsesSynced, updateFormLastSynced, getForm } from '../db/database'
import { syncResponses } from '../api/server'
import { ResponseRecord } from '../types'

export async function syncAll(): Promise<{ synced: number; errors: number }> {
  const unsynced = await getUnsyncedResponses()
  if (unsynced.length === 0) return { synced: 0, errors: 0 }

  const grouped = new Map<string, ResponseRecord[]>()
  for (const r of unsynced) {
    const list = grouped.get(r.formId) || []
    list.push(r)
    grouped.set(r.formId, list)
  }

  let syncedCount = 0
  let errorCount = 0

  for (const [formId, responses] of grouped) {
    const form = await getForm(formId)
    if (!form) {
      errorCount += responses.length
      continue
    }

    const batch = responses.slice(0, 20)
    try {
      const parsed = batch.map((r) => JSON.parse(r.dataJson))
      const result = await syncResponses(formId, form.secret, parsed)

      if (result.ok) {
        await markResponsesSynced(batch.map((r) => r.id))
        await updateFormLastSynced(formId, Date.now())
        syncedCount += batch.length
      } else {
        errorCount += batch.length
      }
    } catch {
      errorCount += batch.length
    }
  }

  return { synced: syncedCount, errors: errorCount }
}
```

- [ ] **Step 2: Create useSync hook**

Create `packages/mobile/src/hooks/useSync.ts`:
```typescript
import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useStore } from '../store'
import { syncAll } from '../sync/engine'

export function useSync() {
  const isOnline = useStore((s) => s.isOnline)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)
  const setLastSynced = useStore((s) => s.setLastSynced)
  const appState = useRef<AppStateStatus>('active')

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isOnline && !isSyncing) runSync()
      }
      appState.current = nextState
    })
    return () => sub.remove()
  }, [isOnline, isSyncing])

  useEffect(() => {
    if (isOnline && !isSyncing) {
      runSync()
    }
  }, [isOnline])

  const runSync = async () => {
    setSyncing(true)
    try {
      await syncAll()
      setLastSynced(Date.now())
    } catch {} finally {
      setSyncing(false)
    }
  }
}
```

- [ ] **Step 3: Wire useSync into root layout**

Add `import { useSync } from '../../src/hooks/useSync'` and call `useSync()` in the `RootLayout` component in `app/_layout.tsx`.

- [ ] **Step 4: Verify TypeScript**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add packages/mobile/src/sync/engine.ts packages/mobile/src/hooks/useSync.ts packages/mobile/app/_layout.tsx
git commit -m "feat: add sync engine with auto-sync on connectivity"
```

---

### Task 18: Final integration and build verification

**Files:**
- Check all files compile and project builds

- [ ] **Step 1: Run full TypeScript check**

```bash
cd packages/mobile && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 2: Check Expo export succeeds**

```bash
cd packages/mobile && npx expo export --platform all 2>&1 | tail -5
```
Expected: Export succeeds without error.

- [ ] **Step 3: Run server-side TypeScript check**

```bash
cd apps/web && npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 4: Commit any remaining cleanup**

```bash
git add -A && git commit -m "chore: final integration cleanup and typecheck"
```

---

## Task Summary

| # | Task | Files |
|---|------|-------|
| 1 | Prisma `mobileSecret` | `prisma/schema.prisma` |
| 2 | Secret in export endpoint | `api/forms/[id]/export/route.ts` |
| 3 | Mobile sync endpoint | `api/mobile/responses/route.ts` (new) |
| 4 | Initialize Expo project | `packages/mobile/` (new) |
| 5 | SQLite database layer | `src/db/database.ts` (new) |
| 6 | API client | `src/api/server.ts` (new) |
| 7 | Zustand store + connectivity | `src/store.ts`, `src/hooks/useConnectivity.ts` (new) |
| 8 | Tab navigator layout | `app/_layout.tsx`, `app/(tabs)/_layout.tsx` |
| 9 | Forms list screen | `app/(tabs)/forms.tsx` (new) |
| 10 | QR scan screen | `app/(tabs)/scan.tsx` (new) |
| 11 | Settings screen | `app/(tabs)/settings.tsx` (new) |
| 12 | Text field components | 5 files in `renderer/fields/` |
| 13 | Choice field components | 3 files in `renderer/fields/` |
| 14 | Date/file/rating fields | 3 files in `renderer/fields/` |
| 15 | Form renderer container | 3 files in `renderer/` |
| 16 | Form fill screen | `app/form/[id].tsx` (new) |
| 17 | Sync engine | `src/sync/engine.ts`, `src/hooks/useSync.ts` (new) |
| 18 | Integration + build verify | All files |
