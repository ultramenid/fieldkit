# FieldKit Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static marketing/launcher page at `app/page.tsx` matching the `fieldkit-launcher.html` prototype exactly.

**Architecture:** Pure Server Components — no client JS, no data fetching. Five focused components under `src/components/landing/` composed in `app/page.tsx`. Tailwind utility classes map directly to the prototype's CSS custom properties.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS v3

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `apps/web/src/components/landing/nav.tsx` | Create | Top nav bar: logo + Docs/Sign in/Dashboard links |
| `apps/web/src/components/landing/hero.tsx` | Create | Hero: h1, subtext, Get started + Documentation CTAs |
| `apps/web/src/components/landing/screen-card.tsx` | Create | Reusable card: icon, title, description, server/local tag |
| `apps/web/src/components/landing/workflow-strip.tsx` | Create | "How it works" 5-step flow diagram |
| `apps/web/src/components/landing/install-snippet.tsx` | Create | Two code boxes: npm install + fieldkit serve |
| `apps/web/src/app/page.tsx` | Modify | Compose all landing components |

---

## Task 1: `nav.tsx`

**Files:**
- Create: `apps/web/src/components/landing/nav.tsx`

- [ ] **Step 1: Create `apps/web/src/components/landing/nav.tsx`**

```tsx
import Link from 'next/link'

export function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-[14px]">
        <span className="font-sans text-[22px] font-medium tracking-tight">FieldKit</span>
        <nav className="flex gap-5">
          {[
            { label: 'Docs', href: '/docs' },
            { label: 'Sign in', href: '/auth/signin' },
            { label: 'Dashboard', href: '/dashboard' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-neutral-200 px-[14px] py-1.5 text-sm text-neutral-500 transition-colors hover:border-black hover:text-black"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/landing/nav.tsx
git commit -m "feat: add landing Nav component"
```

---

## Task 2: `hero.tsx`

**Files:**
- Create: `apps/web/src/components/landing/hero.tsx`

- [ ] **Step 1: Create `apps/web/src/components/landing/hero.tsx`**

```tsx
import Link from 'next/link'

export function Hero() {
  return (
    <section className="mx-auto w-full max-w-[520px] px-6 pb-[60px] pt-[80px] text-center sm:pt-[80px] max-sm:pt-12 max-sm:pb-10">
      <h1 className="mb-4 font-sans text-[42px] font-medium leading-[1.1] tracking-tight max-sm:text-[32px]">
        Build forms online, collect data anywhere
      </h1>
      <p className="mx-auto mb-8 max-w-[48ch] text-[17px] text-neutral-500">
        Create rich forms in the cloud, deploy them to local networks for offline data collection. Built for NGOs and field teams.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1.5 rounded-full border border-black bg-black px-6 py-3 text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
        >
          Get started
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-6 py-3 text-[15px] font-medium text-black transition-colors hover:border-black"
        >
          Documentation
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/landing/hero.tsx
git commit -m "feat: add landing Hero component"
```

---

## Task 3: `screen-card.tsx`

**Files:**
- Create: `apps/web/src/components/landing/screen-card.tsx`

- [ ] **Step 1: Create `apps/web/src/components/landing/screen-card.tsx`**

```tsx
import Link from 'next/link'

interface ScreenCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  tag: string
  tagVariant: 'server' | 'local'
}

export function ScreenCard({ href, icon, title, description, tag, tagVariant }: ScreenCardProps) {
  const tagClass =
    tagVariant === 'server'
      ? 'text-[#16a34a] border-[color-mix(in_oklch,#16a34a_30%,transparent)]'
      : 'text-[#b45309] border-[color-mix(in_oklch,#f59e0b_30%,transparent)]'

  return (
    <Link
      href={href}
      className="flex flex-col gap-3 rounded-[12px] border border-neutral-200 p-6 text-black no-underline transition-colors hover:border-black"
    >
      <div className="grid h-10 w-10 place-items-center rounded-[10px] border border-neutral-200 bg-[#fafafa]">
        <span className="text-neutral-500 [&>svg]:h-5 [&>svg]:w-5">{icon}</span>
      </div>
      <h3 className="m-0 text-base font-medium">{title}</h3>
      <p className="m-0 text-[13px] text-neutral-500">{description}</p>
      <span className={`self-start rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${tagClass}`}>
        {tag}
      </span>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/landing/screen-card.tsx
git commit -m "feat: add landing ScreenCard component"
```

---

## Task 4: `workflow-strip.tsx`

**Files:**
- Create: `apps/web/src/components/landing/workflow-strip.tsx`

- [ ] **Step 1: Create `apps/web/src/components/landing/workflow-strip.tsx`**

```tsx
import React from 'react'

const steps = [
  { label: 'Build form online', variant: 'green' as const },
  { label: 'Export config', variant: 'default' as const },
  { label: 'Import to local', variant: 'amber' as const },
  { label: 'Collect offline', variant: 'amber' as const },
  { label: 'Sync responses', variant: 'green' as const },
]

const stepClass = {
  green: 'border-[#16a34a] text-[#16a34a]',
  amber: 'border-[#b45309] text-[#b45309]',
  default: 'border-neutral-200 text-black',
}

export function WorkflowStrip() {
  return (
    <div className="rounded-[12px] border border-neutral-200 bg-[#fafafa] p-6">
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-medium">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <span
              className={`whitespace-nowrap rounded-full border px-[14px] py-1.5 ${stepClass[step.variant]}`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-[11px] text-neutral-500">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-neutral-500">
        No internet required during data collection. Works on any local network.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/landing/workflow-strip.tsx
git commit -m "feat: add landing WorkflowStrip component"
```

---

## Task 5: `install-snippet.tsx`

**Files:**
- Create: `apps/web/src/components/landing/install-snippet.tsx`

- [ ] **Step 1: Create `apps/web/src/components/landing/install-snippet.tsx`**

```tsx
export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-neutral-200 p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Quick install
        </p>
        <code className="font-mono text-[13px] text-black">
          npm install -g @fieldkit/local-server
        </code>
      </div>
      <div className="rounded-[12px] border border-neutral-200 p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Start serving
        </p>
        <code className="font-mono text-[13px] text-black">fieldkit serve</code>
        <p className="mt-2 text-[12px] text-neutral-500">
          Then open the admin panel to import configs via the web UI.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/src/components/landing/install-snippet.tsx
git commit -m "feat: add landing InstallSnippet component"
```

---

## Task 6: `app/page.tsx` — Compose the page

**Files:**
- Modify: `apps/web/src/app/page.tsx`

- [ ] **Step 1: Replace `apps/web/src/app/page.tsx` with the full landing page**

```tsx
import { Nav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { ScreenCard } from '@/components/landing/screen-card'
import { WorkflowStrip } from '@/components/landing/workflow-strip'
import { InstallSnippet } from '@/components/landing/install-snippet'

const serverCards = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    description: 'View all forms, stats, share links, and export configurations',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/forms/new',
    title: 'Form Builder',
    description: 'Drag-and-drop editor with field types, validation, and settings',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 3v18M3 12h18" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    title: 'Live Responses',
    description: 'Real-time table with filtering, import from local servers, and CSV export',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    ),
  },
]

const localCards = [
  {
    href: '/docs#local-server',
    title: 'Local Server Admin',
    description: 'Manage imported forms, start/stop server, monitor connected devices, and export collected data',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    href: '/docs#install',
    title: 'Installation Guide',
    description: 'Install via npm on Windows, macOS, or Linux. Docker image also available.',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
  },
  {
    href: '/docs#sync',
    title: 'Response Data Sync',
    description: 'Export collected responses from local server and import into serverside to compile into one table.',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <Hero />
      <main className="mx-auto w-full max-w-[960px] px-6 pb-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Serverside
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {serverCards.map((card) => (
            <ScreenCard key={card.href + card.title} {...card} />
          ))}
        </div>

        <hr className="my-10 border-t border-neutral-200" />

        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Localserver
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {localCards.map((card) => (
            <ScreenCard key={card.href + card.title} {...card} />
          ))}
        </div>

        <hr className="my-10 border-t border-neutral-200" />

        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          How it works
        </p>
        <div className="mb-6">
          <WorkflowStrip />
        </div>
        <InstallSnippet />
      </main>
      <footer className="mt-auto border-t border-neutral-200 px-6 py-6 text-center text-[13px] text-neutral-500">
        FieldKit · Built for field teams
      </footer>
    </div>
  )
}
```

- [ ] **Step 2: Run type-check**

```bash
cd apps/web && npm run type-check
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/web/src/app/page.tsx
git commit -m "feat: build landing page composing all landing components"
```

---

## Task 7: Verify

- [ ] **Step 1: Start the dev server**

```bash
cd apps/web && npm run dev
```

Expected:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in Xs
```

- [ ] **Step 2: Open the browser**

Open `http://localhost:3000`. Verify visually against the prototype (`prototype/fieldkit-launcher.html`):

- [ ] Nav: "FieldKit" logo left, three pill links right
- [ ] Hero: large heading, subtext, two CTA buttons
- [ ] "SERVERSIDE" label + 3 cards (Dashboard, Form Builder, Live Responses) with green tags
- [ ] Divider
- [ ] "LOCALSERVER" label + 3 cards (Local Server Admin, Installation Guide, Response Data Sync) with amber tags
- [ ] Divider
- [ ] "HOW IT WORKS" label + workflow strip with 5 steps and arrows
- [ ] Two install code boxes side by side
- [ ] Footer: "FieldKit · Built for field teams"

- [ ] **Step 3: Check mobile layout**

Resize browser to < 640px wide. Verify:
- Hero h1 is smaller (32px)
- Screen cards stack to 1 column
- Install snippet stacks to 1 column

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add apps/web/src/
git commit -m "fix: landing page visual adjustments"
```

---

## Success Criteria

- [ ] `npm run type-check` passes with zero errors
- [ ] Page renders at `http://localhost:3000` matching the prototype visually
- [ ] All 6 screen cards render with correct icons, titles, descriptions, and tag colors
- [ ] Workflow strip shows 5 steps with correct green/amber/default colors
- [ ] Install snippet shows two code boxes
- [ ] Mobile layout collapses correctly at < 640px
