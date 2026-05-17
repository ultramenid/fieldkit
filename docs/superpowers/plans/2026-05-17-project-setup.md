# FieldKit Project Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the FieldKit monorepo with npm workspaces, shared TypeScript types package, Next.js 14 app with Prisma + PostgreSQL, and MinIO storage config.

**Architecture:** npm workspaces monorepo with two packages: `apps/web` (Next.js 14 App Router) and `packages/form-schema` (shared types only, no build step). Prisma manages the PostgreSQL schema. MinIO is wired via AWS SDK v3 S3-compatible client — config only, no upload logic yet.

**Tech Stack:** Node.js 20, npm workspaces, Next.js 14, TypeScript 5 (strict), Tailwind CSS v3, NextAuth.js v5, Prisma 5, PostgreSQL, `@aws-sdk/client-s3`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Create | Workspace root — defines workspaces, no dependencies |
| `.gitignore` | Create | Ignore node_modules, .env*, .next, prisma/migrations noise |
| `packages/form-schema/package.json` | Create | Package name `@fieldkit/form-schema`, types only |
| `packages/form-schema/tsconfig.json` | Create | Strict TS, no emit |
| `packages/form-schema/src/form-config.ts` | Create | FormConfig, Field, FieldType, FieldValidation, FormSettings |
| `packages/form-schema/src/response-data.ts` | Create | ResponseData, Submission, SubmissionAnswer |
| `packages/form-schema/src/index.ts` | Create | Re-exports from both modules |
| `apps/web/package.json` | Create | Next.js app, depends on `@fieldkit/form-schema` |
| `apps/web/tsconfig.json` | Create | Strict TS, path alias `@fieldkit/form-schema` → package src |
| `apps/web/next.config.ts` | Create | Minimal Next.js config, transpiles workspace package |
| `apps/web/tailwind.config.ts` | Create | Tailwind v3 config scoped to `src/` |
| `apps/web/postcss.config.js` | Create | PostCSS for Tailwind |
| `apps/web/.env.example` | Create | All required env vars documented |
| `apps/web/prisma/schema.prisma` | Create | User, Form, Response models |
| `apps/web/src/app/layout.tsx` | Create | Root layout with Tailwind globals |
| `apps/web/src/app/page.tsx` | Create | Placeholder home page |
| `apps/web/src/app/globals.css` | Create | Tailwind directives |
| `apps/web/src/lib/db.ts` | Create | Singleton Prisma client |
| `apps/web/src/lib/auth.ts` | Create | NextAuth v5 config with Google provider |
| `apps/web/src/lib/storage.ts` | Create | MinIO S3Client config + STORAGE_BUCKET constant |
| `apps/web/src/types/next-auth.d.ts` | Create | Augments NextAuth Session type to include `user.id` |

---

## Task 1: Workspace Root

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: Create the workspace root `package.json`**

```json
{
  "name": "fieldkit",
  "version": "0.0.1",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "engines": {
    "node": ">=20"
  }
}
```

Save to: `package.json`

- [ ] **Step 2: Create `.gitignore`**

```gitignore
# dependencies
node_modules/
.pnp
.pnp.js

# Next.js
apps/web/.next/
apps/web/out/

# env files
.env
.env.local
.env.*.local

# Prisma
apps/web/prisma/migrations/

# build outputs
dist/
build/

# OS
.DS_Store
Thumbs.db

# logs
*.log
npm-debug.log*
```

Save to: `.gitignore`

- [ ] **Step 3: Commit**

```bash
git add package.json .gitignore
git commit -m "chore: add workspace root and gitignore"
```

---

## Task 2: `packages/form-schema` — Shared Types

**Files:**
- Create: `packages/form-schema/package.json`
- Create: `packages/form-schema/tsconfig.json`
- Create: `packages/form-schema/src/form-config.ts`
- Create: `packages/form-schema/src/response-data.ts`
- Create: `packages/form-schema/src/index.ts`

- [ ] **Step 1: Create `packages/form-schema/package.json`**

```json
{
  "name": "@fieldkit/form-schema",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  }
}
```

Save to: `packages/form-schema/package.json`

- [ ] **Step 2: Create `packages/form-schema/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Save to: `packages/form-schema/tsconfig.json`

- [ ] **Step 3: Create `packages/form-schema/src/form-config.ts`**

```ts
export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'rating'

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  maxSelections?: number
  acceptedTypes?: string[]
  maxFileSize?: number
  maxStars?: number
  minDate?: string
  maxDate?: string
}

export interface Field {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: string[]
  validation?: FieldValidation
}

export interface FormSettings {
  submitButtonText: string
  confirmationMessage: string
  allowMultipleSubmissions: boolean
}

export interface FormConfig {
  formId: string
  title: string
  description: string
  version: number
  exportedAt: string
  fields: Field[]
  settings: FormSettings
}
```

Save to: `packages/form-schema/src/form-config.ts`

- [ ] **Step 4: Create `packages/form-schema/src/response-data.ts`**

```ts
export interface SubmissionAnswer {
  fieldId: string
  value: string | string[] | number | null
}

export interface Submission {
  submissionId: string
  formId: string
  submittedAt: string
  source: 'online' | string
  answers: SubmissionAnswer[]
}

export type ResponseData = Submission[]
```

Save to: `packages/form-schema/src/response-data.ts`

- [ ] **Step 5: Create `packages/form-schema/src/index.ts`**

```ts
export * from './form-config'
export * from './response-data'
```

Save to: `packages/form-schema/src/index.ts`

- [ ] **Step 6: Commit**

```bash
git add packages/
git commit -m "feat: add form-schema shared types package"
```

---

## Task 3: `apps/web` — Package Config

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/postcss.config.js`

- [ ] **Step 1: Create `apps/web/package.json`**

```json
{
  "name": "@fieldkit/web",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@fieldkit/form-schema": "*",
    "@auth/prisma-adapter": "1.6.0",
    "@aws-sdk/client-s3": "3.600.0",
    "@prisma/client": "5.16.0",
    "next": "14.2.5",
    "next-auth": "5.0.0-beta.19",
    "react": "18.3.1",
    "react-dom": "18.3.1"
  },
  "devDependencies": {
    "@types/node": "20.14.10",
    "@types/react": "18.3.3",
    "@types/react-dom": "18.3.0",
    "autoprefixer": "10.4.19",
    "postcss": "8.4.39",
    "prisma": "5.16.0",
    "tailwindcss": "3.4.6",
    "typescript": "5.5.3"
  }
}
```

Save to: `apps/web/package.json`

- [ ] **Step 2: Create `apps/web/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@fieldkit/form-schema": ["../../packages/form-schema/src/index.ts"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Save to: `apps/web/tsconfig.json`

- [ ] **Step 3: Create `apps/web/next.config.ts`**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@fieldkit/form-schema'],
}

export default nextConfig
```

Save to: `apps/web/next.config.ts`

- [ ] **Step 4: Create `apps/web/tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      colors: {
        accent: '#8b4513',
      },
      borderRadius: {
        container: '12px',
      },
    },
  },
  plugins: [],
}

export default config
```

Save to: `apps/web/tailwind.config.ts`

- [ ] **Step 5: Create `apps/web/postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Save to: `apps/web/postcss.config.js`

- [ ] **Step 6: Install dependencies from repo root**

```bash
npm install
```

Expected: npm installs all workspace dependencies, creates root `node_modules/`, symlinks `@fieldkit/form-schema` into `apps/web/node_modules/`.

- [ ] **Step 7: Commit**

```bash
git add apps/web/package.json apps/web/tsconfig.json apps/web/next.config.ts apps/web/tailwind.config.ts apps/web/postcss.config.js package-lock.json
git commit -m "chore: scaffold apps/web Next.js package config"
```

---

## Task 4: Prisma Schema

**Files:**
- Create: `apps/web/prisma/schema.prisma`
- Create: `apps/web/.env.example`

- [ ] **Step 1: Create `apps/web/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
  forms     Form[]
}

model Form {
  id          String     @id @default(cuid())
  title       String
  description String     @default("")
  schema      Json
  userId      String
  user        User       @relation(fields: [userId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  responses   Response[]
}

model Response {
  id          String   @id @default(cuid())
  formId      String
  form        Form     @relation(fields: [formId], references: [id])
  data        Json
  source      String   @default("online")
  submittedAt DateTime @default(now())
}
```

Save to: `apps/web/prisma/schema.prisma`

- [ ] **Step 2: Create `apps/web/.env.example`**

```bash
# PostgreSQL
DATABASE_URL="postgresql://fieldkit:changeme@localhost:5432/fieldkit"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth — https://console.cloud.google.com/
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MinIO (S3-compatible storage)
S3_ENDPOINT="http://localhost:9000"
S3_ACCESS_KEY="fieldkit"
S3_SECRET_KEY="changeme123"
S3_BUCKET="fieldkit-uploads"
S3_REGION="us-east-1"
```

Save to: `apps/web/.env.example`

- [ ] **Step 3: Copy `.env.example` to `.env.local` and fill in `DATABASE_URL`**

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` — set `DATABASE_URL` to point at your local Postgres instance. The other vars can stay as placeholders for now.

- [ ] **Step 4: Run Prisma migration**

```bash
cd apps/web && npx prisma migrate dev --name init
```

Expected output:
```
Applying migration `20260517000000_init`
Your database is now in sync with your schema.
✔ Generated Prisma Client
```

If Postgres isn't running locally, start it first:
```bash
docker run -d --name fieldkit-pg \
  -e POSTGRES_DB=fieldkit \
  -e POSTGRES_USER=fieldkit \
  -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 \
  postgres:16-alpine
```

- [ ] **Step 5: Commit**

```bash
git add apps/web/prisma/schema.prisma apps/web/.env.example
git commit -m "feat: add Prisma schema with User, Form, Response models"
```

---

## Task 5: App Router Scaffold

**Files:**
- Create: `apps/web/src/app/globals.css`
- Create: `apps/web/src/app/layout.tsx`
- Create: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Create `apps/web/src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #ffffff;
  --foreground: #000000;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: system-ui, sans-serif;
}
```

Save to: `apps/web/src/app/globals.css`

- [ ] **Step 2: Create `apps/web/src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FieldKit',
  description: 'Offline-capable form builder for field data collection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Save to: `apps/web/src/app/layout.tsx`

- [ ] **Step 3: Create `apps/web/src/app/page.tsx`**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-black">FieldKit — coming soon</p>
    </main>
  )
}
```

Save to: `apps/web/src/app/page.tsx`

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/
git commit -m "feat: add App Router scaffold with Tailwind globals"
```

---

## Task 6: Library Files — db, auth, storage

**Files:**
- Create: `apps/web/src/lib/db.ts`
- Create: `apps/web/src/lib/auth.ts`
- Create: `apps/web/src/lib/storage.ts`

- [ ] **Step 1: Create `apps/web/src/lib/db.ts`**

```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
```

Save to: `apps/web/src/lib/db.ts`

- [ ] **Step 2: Create `apps/web/src/lib/auth.ts`**

```ts
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
})
```

Save to: `apps/web/src/lib/auth.ts`

- [ ] **Step 3: Extend the NextAuth session type**

NextAuth v5 requires a type augmentation so `session.user.id` is recognized by TypeScript. Create `apps/web/src/types/next-auth.d.ts`:

```ts
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
```

Save to: `apps/web/src/types/next-auth.d.ts`

- [ ] **Step 4: Create `apps/web/src/lib/storage.ts`**

```ts
import { S3Client } from '@aws-sdk/client-s3'

export const storageClient = new S3Client({
  endpoint: process.env.S3_ENDPOINT!,
  region: process.env.S3_REGION ?? 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // required for MinIO
})

export const STORAGE_BUCKET = process.env.S3_BUCKET ?? 'fieldkit-uploads'
```

Save to: `apps/web/src/lib/storage.ts`

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/lib/ apps/web/src/types/
git commit -m "feat: add db, auth, and storage lib modules"
```

---

## Task 7: Verify the Setup

- [ ] **Step 1: Run type-check from `apps/web`**

```bash
cd apps/web && npm run type-check
```

Expected: no errors. If you see errors about missing `next-env.d.ts`, run `next dev` once first to generate it, then re-run type-check.

- [ ] **Step 2: Start the dev server**

```bash
cd apps/web && npm run dev
```

Expected output:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in Xs
```

Open `http://localhost:3000` — should show "FieldKit — coming soon" centered on a white page.

- [ ] **Step 3: Verify `@fieldkit/form-schema` import works**

Add a temporary import to `apps/web/src/app/page.tsx` to confirm the path alias resolves:

```tsx
import type { FormConfig } from '@fieldkit/form-schema'

export default function Home() {
  const _test: FormConfig | undefined = undefined
  return (
    <main className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-black">FieldKit — coming soon</p>
    </main>
  )
}
```

Run `npm run type-check` — should pass. Then remove the `_test` line (keep the import if you want, or remove it too).

- [ ] **Step 4: Final commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "chore: verify form-schema import resolves correctly"
```

---

## Success Criteria Checklist

- [ ] `npm install` from repo root completes without errors
- [ ] `@fieldkit/form-schema` types importable in `apps/web` via path alias
- [ ] `npx prisma migrate dev --name init` runs clean
- [ ] `npm run dev` starts without errors, page renders at `http://localhost:3000`
- [ ] `npm run type-check` passes with zero errors
- [ ] `src/lib/storage.ts` exports `storageClient` and `STORAGE_BUCKET` without type errors
