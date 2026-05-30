'use client'

import Link from 'next/link'
import { useRef, type PointerEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

interface MagneticButtonProps {
  href: string
  children: React.ReactNode
  className?: string
  /** maximum pull toward the cursor, in px */
  strength?: number
}

/**
 * A link that gently pulls toward the cursor while hovered. The effect only
 * runs on fine pointers (mouse) and with motion enabled; touch and
 * reduced-motion users get a plain link.
 */
export function MagneticButton({ href, children, className, strength = 6 }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)
  const xTo = useRef<((v: number) => void) | null>(null)
  const yTo = useRef<((v: number) => void) | null>(null)
  const enabled = useRef(false)

  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      enabled.current =
        window.matchMedia('(pointer: fine)').matches &&
        window.matchMedia('(prefers-reduced-motion: no-preference)').matches
      if (!enabled.current) return

      xTo.current = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3.out' })
      yTo.current = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3.out' })
    },
    { scope: ref },
  )

  function handleMove(e: PointerEvent<HTMLAnchorElement>) {
    if (!enabled.current || !xTo.current || !yTo.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const relX = e.clientX - rect.left - rect.width / 2
    const relY = e.clientY - rect.top - rect.height / 2
    xTo.current((relX / (rect.width / 2)) * strength)
    yTo.current((relY / (rect.height / 2)) * strength)
  }

  function handleLeave() {
    xTo.current?.(0)
    yTo.current?.(0)
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {children}
    </Link>
  )
}
