'use client'

import { useEffect, useState } from 'react'

type DocsSection = {
  id: string
  title: string
}

type DocsSidebarProps = {
  sections: DocsSection[]
}

const HEADER_OFFSET = 96

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
        rootMargin: `-${HEADER_OFFSET}px 0px -55% 0px`,
        threshold: [0, 0.15, 0.35],
      },
    )

    sectionElements.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className="lg:sticky lg:top-8 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <p className="mb-4 hidden font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)] lg:block">
        On this page
      </p>
      <nav aria-label="Table of contents" className="flex gap-1.5 overflow-x-auto border-b border-[var(--border)] pb-4 lg:flex-col lg:border-b-0 lg:pb-0">
        {sections.map((section) => {
          const isActive = section.id === activeId

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={isActive ? 'location' : undefined}
              className={[
                'whitespace-nowrap rounded-[var(--radius)] px-3 py-1.5 text-[13px] transition-colors lg:whitespace-normal lg:rounded-[var(--radius-container)] lg:border lg:border-transparent lg:px-3 lg:py-2 lg:text-sm',
                isActive
                  ? 'bg-[var(--fg)] text-[var(--bg)] lg:bg-[var(--surface)] lg:text-[var(--foreground)] lg:border-[var(--border)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)] lg:hover:bg-[var(--surface)] lg:hover:border-[var(--border)]',
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
