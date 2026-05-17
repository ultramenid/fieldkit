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
    const scrollContainer = document.getElementById('docs-content-scroll')
    if (!scrollContainer) return

    function updateActive() {
      const headings = scrollContainer!.querySelectorAll<HTMLElement>('h1[id], h2[id]')
      let current = 'overview'
      for (const heading of headings) {
        if (heading.offsetTop - scrollContainer!.scrollTop <= 100) {
          current = heading.id
        }
      }
      setActiveId(current)
    }

    scrollContainer.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => scrollContainer.removeEventListener('scroll', updateActive)
  }, [])

  function scrollTo(id: string) {
    const scrollContainer = document.getElementById('docs-content-scroll')
    const target = document.getElementById(id)
    if (!scrollContainer || !target) return
    scrollContainer.scrollTo({ top: target.offsetTop - 24, behavior: 'smooth' })
  }

  return (
    <aside className="hidden h-full overflow-y-auto border-r border-[var(--border)] px-5 py-8 md:block">
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
