'use client'

import { useRef, type ElementType, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

interface RevealProps {
  children: ReactNode
  className?: string
  /** stagger between direct children, in seconds */
  stagger?: number
  /** distance the children rise from, in px */
  y?: number
  /** render element */
  as?: ElementType
}

/**
 * Fades and rises its direct children into view on scroll. Animation is
 * skipped entirely for users who prefer reduced motion (children stay
 * in their natural, fully-visible position).
 */
export function Reveal({
  children,
  className,
  stagger = 0.08,
  y = 14,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      const targets = gsap.utils.toArray<HTMLElement>(el.children)
      if (!targets.length) return

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(targets, {
          opacity: 0,
          y,
          duration: 0.55,
          ease: 'power2.out',
          stagger,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        })
      })
    },
    { scope: ref },
  )

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  )
}
