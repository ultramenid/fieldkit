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
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
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
