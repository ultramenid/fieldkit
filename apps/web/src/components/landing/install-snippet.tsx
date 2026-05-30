'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** Types out a command string once it scrolls into view. */
function TypedCommand({ text, delay = 0 }: { text: string; delay?: number }) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(text.length)
  const [typing, setTyping] = useState(false)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        setShown(0)
        const counter = { i: 0 }
        gsap.to(counter, {
          i: text.length,
          duration: Math.min(text.length * 0.035, 2),
          ease: 'none',
          delay,
          onStart: () => setTyping(true),
          onUpdate: () => setShown(Math.round(counter.i)),
          onComplete: () => setTyping(false),
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    },
    { scope: ref },
  )

  return (
    <code ref={ref} className="font-mono text-[13px] text-[var(--foreground)]">
      <span className="mr-2 select-none text-[var(--muted)]">$</span>
      {text.slice(0, shown)}
      {typing && (
        <span className="ml-0.5 inline-block h-[1em] w-[6px] translate-y-[2px] animate-pulse bg-[var(--foreground)]" />
      )}
    </code>
  )
}

export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Install local server
        </p>
        <TypedCommand text="npm install -g @malichamdan/fieldkit-local-server" />
      </div>
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Start serving
        </p>
        <TypedCommand text="fieldkit serve" delay={0.5} />
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Then import configs via the admin panel or scan QR with the mobile app
        </p>
      </div>
    </div>
  )
}
