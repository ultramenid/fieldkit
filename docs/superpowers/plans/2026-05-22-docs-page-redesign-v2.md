# Docs Page Redesign v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the /docs page visually — backdrop-blur sidebar, sticky section headers, hero dot pattern, scroll animations, typed Callout/CodeBlock components, back-to-top button.

**Architecture:** Five files, no new dependencies. Sidebar gets semi-transparent blur treatment and smooth transitions. Content gets sticky h2s, refined typography, fade-up scroll animations via IntersectionObserver, and a CSS dot-grid hero. Callout gains a `type` prop (info/tip/warning) with inline SVG icons. CodeBlock gains a `lang` prop and left accent line. Page layout tightens to 680px max-width with a back-to-top pill button.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, Tailwind CSS 4, no new dependencies

---

### Task 1: CodeBlock — lang prop + left accent line

**Files:**
- Modify: `apps/web/src/components/docs/code-block.tsx`
- Modify: `apps/web/src/components/docs/content.tsx` (add `lang` to CodeBlock usages)

- [ ] **Step 1: Update CodeBlock component**

Replace the current component with one that accepts an optional `lang` prop and renders a left accent line + language label.

```tsx
export function CodeBlock({ lang, children }: { lang?: string; children: React.ReactNode }) {
  return (
    <div className="relative mb-4 max-w-[640px] overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[var(--surface)] pl-4 pr-[18px] py-3.5">
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[var(--border)]" />
      {lang ? (
        <span className="absolute right-3 top-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-light)]">
          {lang}
        </span>
      ) : null}
      <pre className="m-0 whitespace-pre font-mono text-[13px] leading-[1.7] text-[var(--foreground)]">
        <code>{children}</code>
      </pre>
    </div>
  )
}
```

- [ ] **Step 2: Add `lang` prop to CodeBlock usages in content.tsx**

Read through content.tsx (already in context) and add `lang="bash"` to the two code blocks:

Line 333: `<CodeBlock>npm install -g @malichamdan/fieldkit-local-server</CodeBlock>`
→ `<CodeBlock lang="bash">npm install -g @malichamdan/fieldkit-local-server</CodeBlock>`

Line 338: `<CodeBlock>fieldkit --version</CodeBlock>`
→ `<CodeBlock lang="bash">fieldkit --version</CodeBlock>`

Line 368 (inside Step): `<CodeBlock>fieldkit</CodeBlock>`
→ `<CodeBlock lang="bash">fieldkit</CodeBlock>`

- [ ] **Step 3: Type-check**

Run: `npm --prefix apps/web run type-check`
Expected: PASS (no errors)

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/docs/code-block.tsx apps/web/src/components/docs/content.tsx
git commit -m "feat: add lang prop and left accent line to CodeBlock component

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 2: Callout — type prop with inline SVG icons

**Files:**
- Modify: `apps/web/src/components/docs/callout.tsx`
- Modify: `apps/web/src/components/docs/content.tsx` (add `type` to Callout usages)

- [ ] **Step 1: Update Callout component**

Replace the current component. Define inline SVG icons for each type, render them in a left gutter.

```tsx
function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TipIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <path d="M8 2c-2 1.5-4.5 3-4.5 6 0 2 1 3.5 2.5 4v1a1 1 0 001 1h2a1 1 0 001-1v-1c1.5-.5 2.5-2 2.5-4 0-3-2.5-4.5-4.5-6z" />
      <path d="M7.5 2.5v-1a.5.5 0 01.5-.5h0a.5.5 0 01.5.5v1" strokeLinecap="round" />
      <line x1="6" y1="7" x2="10" y2="7" strokeLinecap="round" />
      <line x1="8" y1="9" x2="8" y2="9" strokeLinecap="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <path d="M8 2L1.5 13.5h13L8 2z" strokeLinejoin="round" />
      <path d="M8 6.5v2.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

const icons = {
  info: InfoIcon,
  tip: TipIcon,
  warning: WarningIcon,
}

export function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const Icon = icons[type]
  return (
    <div className="mb-4 flex max-w-[640px] gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-[18px] py-3.5 text-[13px] text-[var(--muted)] [&_strong]:font-semibold [&_strong]:text-[var(--foreground)]">
      <div className="mt-px"><Icon /></div>
      <div className="text-[13px] leading-relaxed text-[var(--muted)] [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-[var(--foreground)]">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add `type` prop to Callout usages in content.tsx**

All existing Callouts default to `type="info"` which is the default, so no changes are strictly needed. But to differentiate, update these specific callouts (line numbers approximate, verify against current file):

- Line ~190 (mobile secret warning): `<Callout>` → `<Callout type="warning">`
- Line ~240 (responses table tip): `<Callout>` → `<Callout type="tip">`
- Line ~318 (localserver hotspot tip): `<Callout>` → `<Callout type="tip">`
- Line ~350 (one-time setup note): default info — leave as `<Callout>`
- Line ~389 (multiple forms tip): `<Callout>` → `<Callout type="tip">`
- Line ~414 (export regularly tip): `<Callout>` → `<Callout type="tip">`
- Line ~514 (server URL note): `<Callout>` → `<Callout type="warning">`
- Line ~594 (pending status tip): `<Callout>` → `<Callout type="tip">`
- Line ~612 (before deleting warning): `<Callout>` → `<Callout type="warning">`

- [ ] **Step 3: Type-check**

Run: `npm --prefix apps/web run type-check`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/docs/callout.tsx apps/web/src/components/docs/content.tsx
git commit -m "feat: add type prop with inline SVG icons to Callout component

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 3: Sidebar — backdrop blur, smooth transitions, focus ring

**Files:**
- Modify: `apps/web/src/components/docs/sidebar.tsx`

- [ ] **Step 1: Update sidebar background and overlay**

Change the sidebar background from solid to semi-transparent with blur:
- Line 112: `bg-[var(--background)]` → `bg-white/95 backdrop-blur-[2px]`

Change the overlay from flat black to blurred:
- Line 110: `bg-black/30` → `bg-black/20 backdrop-blur-sm`

- [ ] **Step 2: Add smooth transition to active nav links**

Add `transition-all duration-200` to the nav link className (line 155-158). The current string:

```tsx
className={`block border-l-2 py-1 pl-[18px] pr-5 text-[13px] leading-snug no-underline transition-colors ${
```

Change `transition-colors` to `transition-all duration-200`:

```tsx
className={`block border-l-2 py-1 pl-[18px] pr-5 text-[13px] leading-snug no-underline transition-all duration-200 ${
```

- [ ] **Step 3: Add focus ring to search input**

On the search input (line 135), add `focus:ring-1 focus:ring-[var(--foreground)]` to the className:

Current:
```
className="h-9 w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] pl-[34px] pr-3 text-[13px] outline-none placeholder:text-[var(--muted-light)] focus:border-[var(--foreground)]"
```

Replace `outline-none` with `outline-none focus:ring-1 focus:ring-[var(--foreground)]`:

```
className="h-9 w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] pl-[34px] pr-3 text-[13px] outline-none placeholder:text-[var(--muted-light)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)]"
```

- [ ] **Step 4: Type-check**

Run: `npm --prefix apps/web run type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/docs/sidebar.tsx
git commit -m "feat: add backdrop-blur sidebar, smooth transitions, search focus ring

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 4: Content — sticky h2s, typography, hero dots, scroll animations, step hover

**Files:**
- Modify: `apps/web/src/components/docs/content.tsx`

This is the largest task. The content component becomes a client component to support IntersectionObserver-based scroll animations and sticky header border detection.

- [ ] **Step 1: Add 'use client' directive and animation hook**

Add `'use client'` at the very top of content.tsx (before imports). Then add a custom hook and animation logic after the `InlineC` component, before `DocsContent`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { CodeBlock } from './code-block'
import { Callout } from './callout'

// ... Step and InlineC stay the same ...

function useScrollReveal() {
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('.section[data-reveal]')
    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -40px 0px' }
    )

    for (const s of sections) observer.observe(s)
    return () => observer.disconnect()
  }, [])
}

function useStickyH2Border() {
  useEffect(() => {
    const h2s = document.querySelectorAll<HTMLElement>('h2.sticky-observe')
    if (h2s.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.intersectionRatio < 1) {
            entry.target.classList.add('stuck')
          } else {
            entry.target.classList.remove('stuck')
          }
        }
      },
      { rootMargin: '-1px 0px 0px 0px', threshold: 1 }
    )

    for (const h of h2s) observer.observe(h)
    return () => observer.disconnect()
  }, [])
}
```

- [ ] **Step 2: Wire hooks into DocsContent**

At the top of the `DocsContent` function body, call both hooks:

```tsx
export function DocsContent() {
  useScrollReveal()
  useStickyH2Border()
  // ... rest of component
```

- [ ] **Step 3: Update h1 typography**

Change line ~31:
- `text-[28px]` → `text-[30px]`
- `tracking-[-0.02em]` → `tracking-[-0.03em]`
- Increase bottom margin: `mb-1` → `mb-2`

```tsx
<h1 className="mb-2 font-[var(--font-display)] text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[var(--foreground)]">
```

- [ ] **Step 4: Add hero dot pattern to #introduction section**

Add a decorative dot-grid background behind the title. Change the intro `<section>` opening (line ~30) to include a relative wrapper:

```tsx
<section className="section mb-16 scroll-mt-20" id="introduction" data-reveal>
  <div
    className="absolute left-0 top-0 h-[280px] w-full opacity-[0.35]"
    style={{
      backgroundImage: 'radial-gradient(circle, var(--border, #e5e5e5) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
      maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
    }}
    aria-hidden="true"
  />
  <div className="relative">
    <h1 className="...">Documentation</h1>
    <p className="...">Everything you need to build forms online...</p>
    {/* rest of intro content stays the same */}
  </div>
</section>
```

Wait — the section already has content directly inside it. We need to wrap the content in a relative container so the absolute dot pattern sits behind. Let me adjust the approach: add `relative` to the section itself and a dot-pattern div as the first child with `pointer-events-none`. The existing content stays as-is.

The intro section opening becomes:

```tsx
<section className="section relative mb-16 scroll-mt-20" id="introduction" data-reveal>
  <div
    className="pointer-events-none absolute inset-0 -top-8 h-[300px] opacity-[0.3]"
    style={{
      backgroundImage: 'radial-gradient(circle, var(--border, #e5e5e5) 1px, transparent 1px)',
      backgroundSize: '18px 18px',
      maskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
      WebkitMaskImage: 'linear-gradient(to bottom, black 30%, transparent 100%)',
    }}
    aria-hidden="true"
  />
  <h1 className="mb-2 font-[var(--font-display)] text-[30px] font-semibold leading-tight tracking-[-0.03em] text-[var(--foreground)]">
    Documentation
  </h1>
  {/* rest stays the same */}
```

- [ ] **Step 5: Update all h2 elements to be sticky**

Every `<h2>` needs: `sticky top-0 z-10 bg-white/90 backdrop-blur-sm pb-2 sticky-observe`, and add `border-b border-transparent` with a `stuck` state that switches to `border-[var(--border)]`.

Add this CSS via a `<style>` tag or Tailwind arbitrary variants. Simplest: use a `style` jsx tag or... actually, since we're using Tailwind and can't do `group-[.stuck]:border-b-[var(--border)]` easily, use a global style approach.

Better approach: Use Tailwind's `[&.stuck]:border-b-[var(--border)]` arbitrary variant on the h2.

Update every `<h2>` from:
```tsx
<h2 className="mb-3 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)]">
```

To:
```tsx
<h2 className="sticky top-0 z-10 mb-3 bg-white/90 backdrop-blur-sm pb-2 font-[var(--font-display)] text-[22px] font-semibold text-[var(--foreground)] border-b border-transparent [&.stuck]:border-b [&.stuck]:border-[var(--border)] sticky-observe">
```

There are 15 `<h2>` elements (sections excluding #introduction which has an h1). Update each one.

- [ ] **Step 6: Update h3 typography**

All `<h3>` elements: `text-[14px]` → `text-[15px]`, `mt-5` → `mt-6`.

The pattern is consistent across the file — use replace_all:

Find: `className="mb-2 mt-5 text-[14px] font-semibold text-[var(--foreground)]"`
Replace: `className="mb-2 mt-6 text-[15px] font-semibold text-[var(--foreground)]"`

- [ ] **Step 7: Update section gaps and scroll-margin**

- All `mb-12` on `<section>` → `mb-16` (replace_all)
- All `scroll-mt-12` → `scroll-mt-20` (replace_all, to account for sticky h2)
- Add `data-reveal` attribute to all `<section>` elements for scroll animation

The current pattern is:
```tsx
<section className="section mb-12 scroll-mt-12" id="...">
```

Change all to:
```tsx
<section className="section mb-16 scroll-mt-20" id="..." data-reveal>
```

Add the reveal CSS animation. Add this style block inside the component's return (before the first section) or use a useEffect to inject styles. Better: use Tailwind classes with `revealed` state.

Add a `<style>` element at the top of the return (inside the fragment):

```tsx
<style>{`
  .section[data-reveal] {
    opacity: 0;
    transform: translateY(8px);
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  .section[data-reveal].revealed {
    opacity: 1;
    transform: translateY(0);
  }
  h2.sticky-observe.stuck {
    border-bottom-color: var(--border, #e5e5e5);
  }
`}</style>
```

- [ ] **Step 8: Add step number hover effect**

Update the Step component's number span to include a transition on background:

Current:
```tsx
<span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-mono text-[12px] font-medium text-[var(--muted)]">
```

Change to:
```tsx
<span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] font-mono text-[12px] font-medium text-[var(--muted)] transition-colors duration-150 group-hover:bg-[var(--border)]">
```

Also add `group` to the parent div:
```tsx
<div className="group mb-5 flex max-w-[640px] gap-3.5">
```

- [ ] **Step 9: Type-check**

Run: `npm --prefix apps/web run type-check`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add apps/web/src/components/docs/content.tsx
git commit -m "feat: sticky h2s, hero dot pattern, scroll animations, refined typography

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 5: Page layout — max-width, padding, back-to-top button

**Files:**
- Modify: `apps/web/src/app/docs/page.tsx`

- [ ] **Step 1: Update layout values**

Change the `<main>` className:
- `max-w-[780px]` → `max-w-[680px]`
- `px-12 py-10` → `px-12 pt-16`
- Keep `style={{ paddingBottom: 80 }}` or change to `pb-[100px]`

```tsx
<main className="relative ml-[260px] max-w-[680px] px-12 pt-16 max-md:ml-0 max-md:px-5 max-md:py-8" style={{ paddingBottom: 100 }}>
  <DocsContent />
</main>
```

- [ ] **Step 2: Add back-to-top button**

Add a client component for the back-to-top button at the bottom of the file (or inline since the page is a server component — use a small client wrapper).

Since `page.tsx` is a server component, create the button as a separate client component. Add to `apps/web/src/components/docs/back-to-top.tsx`:

```tsx
'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const sentinel = document.getElementById('introduction')
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting)
      },
      { rootMargin: '-200px 0px 0px 0px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--muted)] transition-all duration-200 hover:text-[var(--foreground)] hover:border-[var(--foreground)] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <path d="M8 12.5V3.5M4.5 7L8 3.5 11.5 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
```

- [ ] **Step 3: Import and render BackToTop in page.tsx**

Update page.tsx:

```tsx
import { Sidebar } from '@/components/docs/sidebar'
import { DocsContent } from '@/components/docs/content'
import { BackToTop } from '@/components/docs/back-to-top'

export const metadata = {
  title: 'Documentation · FieldKit',
  description: 'Everything you need to build forms online and collect data offline.',
}

export default function DocsPage() {
  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <Sidebar />
      <main className="relative ml-[260px] max-w-[680px] px-12 pt-16 max-md:ml-0 max-md:px-5 max-md:py-8" style={{ paddingBottom: 100 }}>
        <DocsContent />
      </main>
      <BackToTop />
    </div>
  )
}
```

- [ ] **Step 4: Type-check**

Run: `npm --prefix apps/web run type-check`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/docs/page.tsx apps/web/src/components/docs/back-to-top.tsx
git commit -m "feat: tighten docs layout to 680px, add back-to-top button

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

---

### Task 6: Verify — dev server smoke test

**Files:** none (verification only)

- [ ] **Step 1: Start dev server and check for errors**

Run: `npm --prefix apps/web run dev` (if not already running)
Navigate: `http://localhost:3000/docs`

Check browser console for errors. Expected: 0 errors.

- [ ] **Step 2: Verify visual changes**

Checklist:
- [ ] Sidebar has backdrop-blur effect (translucent, content peeks through on scroll)
- [ ] Active sidebar link transitions smoothly on scroll
- [ ] Search input shows focus ring on click
- [ ] Hero area has subtle dot-grid pattern
- [ ] h2 headers stick to top with backdrop-blur when scrolling
- [ ] h2 headers get bottom border when stuck
- [ ] h3 is 15px (slightly larger)
- [ ] Sections fade up on first scroll into view
- [ ] Step number circles shift background on hover
- [ ] CodeBlocks have left accent line + language label (BASH)
- [ ] Callouts have type icons (warning triangle, tip bulb, info circle)
- [ ] Back-to-top button appears after scrolling past intro
- [ ] Back-to-top button scrolls to top smoothly
- [ ] Mobile: sidebar overlay is blurred, content padding is correct
