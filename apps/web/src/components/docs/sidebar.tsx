'use client'

import { useEffect, useState } from 'react'

const ACTIVE_TOP_OFFSET = 80
const SCROLL_TOP_OFFSET = 24

const sections = [
  {
    label: 'Start Here',
    links: [
      { label: 'What is FieldKit', id: 'overview' },
      { label: 'Quickstart (5 steps)', id: 'quickstart' },
    ],
  },
  {
    label: 'Core Journey',
    links: [
      { label: '1. Build form online', id: 'step-build' },
      { label: '2. Export config', id: 'step-export' },
      { label: '3. Run local server', id: 'step-run-local' },
      { label: '4. Collect offline', id: 'step-collect' },
      { label: '5. Sync responses', id: 'step-sync' },
    ],
  },
  {
    label: 'Support',
    links: [
      { label: 'Troubleshooting', id: 'troubleshooting' },
      { label: 'Reference', id: 'config-format' },
    ],
  },
]

const DEFAULT_ACTIVE_ID = 'overview'

export function Sidebar() {
  const [activeId, setActiveId] = useState(DEFAULT_ACTIVE_ID)
  const [tocOpen, setTocOpen] = useState(false)

  useEffect(() => {
    const scrollContainer = document.getElementById('docs-content-scroll')
    if (!scrollContainer) return

    function updateActive() {
      const containerTop = scrollContainer.getBoundingClientRect().top
      const headings = Array.from(scrollContainer.querySelectorAll<HTMLElement>('h1[id], h2[id]'))
      let current = headings[0]?.id ?? 'overview'
      for (const heading of headings) {
        const top = heading.getBoundingClientRect().top - containerTop
        if (top <= ACTIVE_TOP_OFFSET) {
          current = heading.id
        }
      }
      setActiveId(current)
    }

    scrollContainer.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => scrollContainer.removeEventListener('scroll', updateActive)
  }, [])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const scrollContainer = document.getElementById('docs-content-scroll')
    if (!scrollContainer) return
    const target = scrollContainer.querySelector<HTMLElement>(`#${id}`)
    if (!target) return
    const offset = target.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop - SCROLL_TOP_OFFSET
    scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${id}`)
      if (window.innerWidth < 768) setTocOpen(false)
    }
  }

  return (
    <aside className="border-b border-[var(--border)] px-5 py-5 md:h-full md:overflow-y-auto md:border-b-0 md:border-r md:px-5 md:py-8">
      <button
        type="button"
        aria-expanded={tocOpen}
        aria-controls="docs-toc"
        onClick={() => setTocOpen((v) => !v)}
        className="mb-3 w-full rounded-[9999px] border border-[var(--border)] px-4 py-2 text-left text-[14px] md:hidden"
      >
        On this page
      </button>
      <div id="docs-toc" className={`${tocOpen ? 'block' : 'hidden'} md:block`}>
        {sections.map((group) => (
          <div key={group.label} className="mb-4 md:mb-6">
            <h4 className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)] md:mb-3">
              {group.label}
            </h4>
            <ul className="m-0 list-none p-0">
              {group.links.map(({ label, id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => handleClick(e, id)}
                    className={`block rounded-[12px] px-3 py-1.5 text-[14px] no-underline transition-colors ${
                      activeId === id
                        ? 'bg-[var(--surface)] font-medium text-[var(--foreground)]'
                        : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  )
}
