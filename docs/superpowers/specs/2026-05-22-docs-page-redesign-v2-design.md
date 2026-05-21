# Docs Page Redesign v2

## Goal

Redesign the /docs page with elevated single-column layout — same IA and content,
everything visually refined.

## Approach

**Elevated single-column** (Option A) — keep sidebar + scroll structure, refine every
detail for a more premium, modern feel without restucturing the content.

---

## Layout & Structure

### Sidebar (260px fixed left)

- `backdrop-blur-[2px] bg-white/95` — semi-transparent instead of solid, lets
  content peek through on scroll
- Smooth CSS transitions on active link (border-color + font-weight), no instant
  jump
- Search bar gets subtle focus ring animation via `focus:ring-1 ring-[var(--foreground)]`
- Slightly tighter nav padding (already compact — keep current)

### Content area

- `ml-[260px] max-w-[680px]` (down from 780px for better line measure)
- Top padding: `pt-16` (64px), bottom: `pb-[100px]`
- Section gaps: `mb-16` (was mb-12)

### Sticky section headers

- Each `<h2>` gets `sticky top-0 z-10 backdrop-blur-sm bg-white/90` with
  a subtle bottom border that appears when stuck (via JS intersection observer:
  toggle `border-b border-[var(--border)]` class when not at scroll-top)

### Hero area (#introduction)

- Subtle CSS `radial-gradient` repeating-dot pattern behind title area
- Pattern uses `--border` at very low opacity, covers ~300px band
- Pure CSS, no image asset

### Mobile (< 768px)

- Sidebar drawer overlay uses blur instead of flat black
- Content: `px-5 py-8`
- Same sidebar toggle behavior

---

## Typography & Spacing

- **h1**: 30px (was 28px), tracking -0.03em, bottom margin increased
- **h2**: 22px unchanged, but now sticky (see above)
- **h3**: 15px (was 14px), `mt-6` (was mt-5)
- **Body**: 14px, 1.55 leading, `max-w-[640px]` — unchanged
- **Step component**: h3 14px, desc 13px — unchanged. Subtle bg shift on step
  number on parent hover
- **Inline code (`InlineC`)**: unchanged

---

## Component Refinements

### CodeBlock

- Add `lang` prop for optional language label (e.g. "BASH", "JSON")
- Label rendered as 11px mono muted uppercase text, top-right corner
- Faint left accent line (1px `--border` line on the left edge, inside padding)

### Callout

- Add `type` prop: `"info"` (default), `"tip"`, `"warning"`
- Each type gets an inline SVG icon in the left gutter
- Info: circle-i glyph, Tip: sparkle/bulb, Warning: triangle/!
- Same border + surface styling, icon adds ~24px to left padding

### Back to top button

- Small pill button, bottom-right corner of viewport
- Appears after scrolling past first section (IntersectionObserver)
- 9999px radius, 1px border, no shadow — matches design system
- Arrow-up SVG icon inside

---

## Animation

- Sections fade up on first scroll-into-view via IntersectionObserver
- `opacity-0 translate-y-2` → `opacity-100 translate-y-0`
- Plays once per section, no re-trigger — CSS transition, no library

---

## Component changes

| File | Change |
|------|--------|
| `apps/web/src/app/docs/page.tsx` | Layout adjustments (max-w, padding), back-to-top button |
| `apps/web/src/components/docs/sidebar.tsx` | Backdrop blur, smooth active transitions, search focus ring |
| `apps/web/src/components/docs/content.tsx` | Sticky h2s, hero dot pattern, scroll animations, step hover |
| `apps/web/src/components/docs/callout.tsx` | Add `type` prop with icon slot |
| `apps/web/src/components/docs/code-block.tsx` | Add `lang` prop, left accent line |

## Not changing

- Section content (16 sections, same text)
- Sidebar nav structure (4 groups, search, scroll spy)
- Design system tokens (--foreground, --muted, --border, --surface, --background)
- No new dependencies
