'use client'

import { useEffect, useState } from 'react'

const sections = [
  {
    label: 'Getting Started',
    links: [
      { label: 'Overview', id: 'overview' },
      { label: 'How it works', id: 'how-it-works' },
      { label: 'Quickstart', id: 'quickstart' },
    ],
  },
  {
    label: 'Serverside',
    links: [
      { label: 'Create a form', id: 'create-form' },
      { label: 'Share & publish', id: 'share-form' },
      { label: 'Export config', id: 'export-config' },
      { label: 'View responses', id: 'responses' },
    ],
  },
  {
    label: 'Local Server',
    links: [
      { label: 'Installation', id: 'install' },
      { label: 'Setup & config', id: 'setup' },
      { label: 'Running', id: 'run' },
      { label: 'Sync response data', id: 'sync' },
    ],
  },
  {
    label: 'Reference',
    links: [
      { label: 'Config format', id: 'config-format' },
      { label: 'API endpoints', id: 'api' },
      { label: 'Troubleshooting', id: 'troubleshooting' },
    ],
  },
]

export function Sidebar() {
  const [activeId, setActiveId] = useState('overview')

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>('h1[id], h2[id]')
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-10% 0px -80% 0px' }
    )
    headings.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <aside className="sticky top-[60px] hidden h-fit max-h-[calc(100dvh-60px)] overflow-y-auto border-r border-[var(--border)] px-5 py-8 md:block">
      {sections.map((group) => (
        <div key={group.label} className="mb-6">
          <h4 className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            {group.label}
          </h4>
          <ul className="m-0 list-none p-0">
            {group.links.map(({ label, id }) => (
              <li key={id}>
                <button
                  onClick={() => scrollTo(id)}
                  className={`block w-full rounded-[8px] px-3 py-1.5 text-left text-[14px] transition-colors ${
                    activeId === id
                      ? 'bg-[var(--surface)] font-medium text-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
