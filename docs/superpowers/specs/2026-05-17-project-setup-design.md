# FieldKit — Project Setup Design

**Date:** 2026-05-17  
**Scope:** Step 1 — monorepo scaffold, shared types package, Next.js app, Prisma schema

---

## Monorepo Structure

npm workspaces monorepo rooted at the repo root. Two workspace packages for step 1:

```
fieldkit/
├── package.json                  # workspace root (workspaces: ["apps/*", "packages/*"])
├── .gitignore
├── apps/
│   └── web/                      # Next.js 14 App Router
│       ├── package.json
│       ├── tsconfig.json
│       ├── tailwind.config.ts
│       ├── next.config.ts
│       ├── .env.example
│       ├── prisma/
│       │   └── schema.prisma
│       └── src/
│           ├── app/              # App Router root (layout.tsx, page.tsx placeholders)
│           ├── lib/
│           │   ├── db.ts         # singleton Prisma client
│           │   └── auth.ts       # NextAuth config (Google provider)
│           └── components/       # empty, ready for step 2+
└── packages/
    └── form-schema/              # shared TypeScript types, no runtime code
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts          # re-exports everything
            ├── form-config.ts    # FormConfig, Field, FieldType, FieldValidation, FormSettings
            └── response-data.ts  # ResponseData, Submission, SubmissionAnswer
```

---

## `packages/form-schema` — Shared Types

Types only. No build step — `apps/web` imports via TypeScript path alias (`@fieldkit/form-schema`).

### `form-config.ts`

```ts
export type FieldType =
  | 'text' | 'email' | 'number' | 'textarea'
  | 'select' | 'radio' | 'checkbox'
  | 'date' | 'file' | 'rating'

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
  options?: string[]        // select, radio, checkbox
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
  exportedAt: string        // ISO 8601
  fields: Field[]
  settings: FormSettings
}
```

### `response-data.ts`

```ts
export interface SubmissionAnswer {
  fieldId: string
  value: string | string[] | number | null
}

export interface Submission {
  submissionId: string
  formId: string
  submittedAt: string       // ISO 8601
  source: 'online' | string // 'online' or local server identifier
  answers: SubmissionAnswer[]
}

export type ResponseData = Submission[]
```

---

## `apps/web` — Next.js App

- **Framework:** Next.js 14, App Router, TypeScript strict mode
- **Styling:** Tailwind CSS v3
- **Auth:** NextAuth.js v5 with Google provider (config wired, no UI yet)
- **ORM:** Prisma with PostgreSQL

### Prisma Schema

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
  schema      Json                          // FormConfig stored as jsonb
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
  data        Json                          // Submission stored as jsonb
  source      String   @default("online")  // 'online' or local server id
  submittedAt DateTime @default(now())
}
```

### Environment Variables (`.env.example`)

```bash
DATABASE_URL="postgresql://fieldkit:changeme@localhost:5432/fieldkit"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### `src/lib/db.ts`

Singleton Prisma client using the standard Next.js pattern (global cache to avoid exhausting connections in dev hot-reload).

### `src/lib/auth.ts`

NextAuth config with Google provider. Extends session to include `user.id`. No custom pages yet — those come in step 2.

---

## What Is NOT in Scope

- No pages beyond placeholder `app/page.tsx`
- No API routes
- No UI components
- No Docker Compose (that's deployment, not setup)
- No local server package (step 8)

---

## Success Criteria

1. `npm install` from repo root installs all workspaces
2. `packages/form-schema` types importable in `apps/web` via `@fieldkit/form-schema`
3. `npx prisma migrate dev --name init` runs clean against a local Postgres instance
4. `npm run dev` in `apps/web` starts without errors
5. TypeScript strict mode passes with `tsc --noEmit`
