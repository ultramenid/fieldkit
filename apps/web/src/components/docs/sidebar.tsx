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
      const headings = Array.from(
        scrollContainer!.querySelectorAll<HTMLElement>('h1[id], h2[id]')
      )
      let current = headings[0]?.id ?? 'overview'
      for (const heading of headings) {
        const top = heading.getBoundingClientRect().top - scrollContainer!.getBoundingClientRect().top
        if (top <= 80) {
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
    const target = document.getElementById(id)
    if (!scrollContainer || !target) return
    const offset = target.getBoundingClientRect().top - scrollContainer.getBoundingClientRect().top + scrollContainer.scrollTop - 24
    scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
    window.history.pushState(null, '', `#${id}`)
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
                <a
                  href={`#${id}`}
                  onClick={(e) => handleClick(e, id)}
                  className={`block rounded-[8px] px-3 py-1.5 text-[14px] no-underline transition-colors ${
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
    </aside>
  )
}
