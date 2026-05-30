'use client'

import { useRef, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { MagneticButton } from './magnetic-button'

gsap.registerPlugin(useGSAP)

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const gridXTo = useRef<((v: number) => void) | null>(null)
  const gridYTo = useRef<((v: number) => void) | null>(null)
  const parallax = useRef(false)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Entrance timeline
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 } })
        tl.from('[data-hero-grid]', { opacity: 0, scale: 1.04, duration: 1.1 })
          .from('[data-hero="badge"]', { opacity: 0, y: 12 }, 0.1)
          .from('[data-hero="title"]', { opacity: 0, y: 18 }, '-=0.45')
          .from('[data-hero="subtitle"]', { opacity: 0, y: 14 }, '-=0.5')
          .from('[data-hero="cta"]', { opacity: 0, y: 12 }, '-=0.5')
          .from('[data-hero="meta"]', { opacity: 0, y: 10 }, '-=0.55')

        // Square-grid parallax
        const grid = gridRef.current
        if (grid && window.matchMedia('(pointer: fine)').matches) {
          parallax.current = true
          gridXTo.current = gsap.quickTo(grid, 'x', { duration: 0.8, ease: 'power3.out' })
          gridYTo.current = gsap.quickTo(grid, 'y', { duration: 0.8, ease: 'power3.out' })
        }
      })
    },
    { scope: root },
  )

  function handleMove(e: PointerEvent<HTMLElement>) {
    if (!parallax.current || !gridXTo.current || !gridYTo.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width - 0.5
    const relY = (e.clientY - rect.top) / rect.height - 0.5
    gridXTo.current(relX * -16)
    gridYTo.current(relY * -16)
  }

  return (
    <section
      ref={root}
      onPointerMove={handleMove}
      className="relative w-full overflow-hidden px-6 pb-[84px] pt-[88px] text-center max-sm:pb-12 max-sm:pt-14"
    >
      {/* square grid — slightly oversized so parallax never reveals an edge */}
      <div
        ref={gridRef}
        data-hero-grid
        className="pointer-events-none absolute -inset-12"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          willChange: 'transform',
        }}
      />
      {/* fade the grid out toward the edges and bottom */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 78% 62% at 50% 0%, transparent 38%, var(--background) 100%)',
        }}
      />
      <div className="relative mx-auto max-w-[560px]">
        <span
          data-hero="badge"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3 py-1 font-mono text-[11px] text-[var(--muted)] backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
          Built for teams in the field
        </span>
        <h1
          data-hero="title"
          className="mb-5 font-sans text-[64px] font-medium leading-[1.0] tracking-[-0.035em] text-[var(--foreground)] max-sm:text-[40px]"
        >
          Build forms online.<br className="max-sm:hidden" /> Collect data anywhere.
        </h1>
        <p
          data-hero="subtitle"
          className="mx-auto mb-9 max-w-[46ch] text-[18px] leading-[1.6] text-[var(--muted)] max-sm:text-[16px]"
        >
          Design forms in the cloud, then collect responses on any device&nbsp;&mdash; across your local network or fully offline. Everything syncs back the moment you&rsquo;re online.
        </p>
        <div data-hero="cta" className="flex flex-wrap justify-center gap-3">
          <MagneticButton
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-[15px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
          >
            Get started
          </MagneticButton>
          <MagneticButton
            href="/docs"
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-6 py-3 text-[15px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          >
            Read docs
          </MagneticButton>
        </div>
        <p data-hero="meta" className="mt-7 font-mono text-[11px] text-[var(--muted)]">
          Free to self-host&nbsp;&nbsp;·&nbsp;&nbsp;Works offline&nbsp;&nbsp;·&nbsp;&nbsp;Open source
        </p>
      </div>
    </section>
  )
}
