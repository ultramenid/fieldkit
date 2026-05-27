'use client'

import { useEffect, useState } from 'react'

type DocsSection = {
  id: string
  title: string
}

type DocsSidebarProps = {
  sections: DocsSection[]
}

export function DocsSidebar({ sections }: DocsSidebarProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const sectionElements = sections
      .map((section) => document.getElementById(section.id))
      .filter((section): section is HTMLElement => section !== null)

    if (sectionElements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]

        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id)
        }
      },
      {
        rootMargin: '-96px 0px -55% 0px',
        threshold: [0, 0.15, 0.35],
      },
    )

    sectionElements.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
        On this page
      </p>
      <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
        {sections.map((section) => {
          const isActive = section.id === activeId

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={[
                'whitespace-nowrap rounded-full border px-3 py-2 text-sm transition-colors lg:whitespace-normal',
                isActive
                  ? 'border-[var(--foreground)] text-[var(--foreground)]'
                  : 'border-transparent text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--foreground)]',
              ].join(' ')}
            >
              {section.title}
            </a>
          )
        })}
      </nav>
    </aside>
  )
}
