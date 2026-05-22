'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'

const sections = [
  {
    title: 'Overview',
    links: [{ label: 'Introduction', id: 'introduction' }],
  },
  {
    title: 'Serverside',
    links: [
      { label: 'Platform overview', id: 'serverside' },
      { label: 'Creating a form', id: 'serverside-create' },
      { label: 'Sharing & publishing', id: 'serverside-share' },
      { label: 'Realtime responses table', id: 'serverside-responses' },
      { label: 'Exporting a form config', id: 'serverside-export' },
    ],
  },
  {
    title: 'Localserver',
    links: [
      { label: 'Overview', id: 'localserver' },
      { label: 'Installation', id: 'localserver-install' },
      { label: 'Importing & serving', id: 'localserver-import' },
      { label: 'Exporting data', id: 'localserver-data' },
      { label: 'Network setup', id: 'localserver-network' },
    ],
  },
  {
    title: 'Mobile Client',
    links: [
      { label: 'Overview', id: 'mobile-overview' },
      { label: 'Importing a form', id: 'mobile-import' },
      { label: 'Collecting responses', id: 'collecting' },
      { label: 'Syncing responses', id: 'syncing' },
      { label: 'Deleting a form', id: 'delete' },
    ],
  },
]

export function Sidebar() {
  const [activeId, setActiveId] = useState('introduction')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const close = useCallback(() => setOpen(false), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return sections
    return sections
      .map((g) => ({
        ...g,
        links: g.links.filter((l) => l.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.links.length > 0)
  }, [query])

  useEffect(() => {
    const el = document.querySelectorAll<HTMLElement>('.section[id]')
    if (el.length === 0) return

    let ticking = false
    function update() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        let best = el[0]?.id ?? 'introduction'
        let bestScore = -Infinity
        const vh = window.innerHeight
        for (const s of el) {
          const r = s.getBoundingClientRect()
          const visible = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top))
          if (visible > bestScore) {
            bestScore = visible
            best = s.id
          }
        }
        setActiveId(best)
        window.history.replaceState(null, '', `#${best}`)
        ticking = false
      })
    }

    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    window.history.replaceState(null, '', `#${id}`)
    if (window.innerWidth <= 768) setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        aria-label="Toggle sidebar"
        onClick={() => setOpen((v) => !v)}
        className="fixed left-3 top-3 z-50 hidden h-10 w-10 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--background)] max-md:flex"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div className={`fixed inset-0 z-40 bg-black/20 backdrop-blur-sm ${open ? 'block' : 'hidden'} md:hidden`} onClick={close} />

      <aside className={`fixed top-0 left-0 bottom-0 z-40 flex w-[260px] flex-col overflow-hidden border-r border-[rgba(0,0,0,0.05)] bg-white/95 backdrop-blur-[2px] max-md:transition-transform max-md:duration-200 ${open ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'}`}>
        <div className="flex-shrink-0 px-5 pt-4">
          <a href="/" className="flex items-center gap-2.5 font-[var(--font-display)] text-[17px] font-medium text-[var(--foreground)] no-underline">
            <svg viewBox="0 0 120 120" fill="none" className="h-6 w-6 flex-shrink-0">
              <path d="M48 24v68" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M48 24h34" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M48 52h26" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
              <circle cx="62" cy="37" r="3.5" fill="currentColor" />
              <path d="M56 63 Q62 69 68 63" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
            </svg>
            FieldKit Docs
          </a>
          <div className="relative mt-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search docs..."
              aria-label="Search documentation"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] pl-[34px] pr-3 text-[13px] outline-none placeholder:text-[var(--muted-light)] focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)]"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5">
          {filtered.length === 0 ? (
            <p className="px-5 text-[12px] text-[var(--muted)]">No results</p>
          ) : (
            filtered.map((group) => (
              <div key={group.title} className="mb-5">
                <h4 className="mb-1.5 px-5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted-light)]">
                  {group.title}
                </h4>
                <ul className="m-0 list-none p-0">
                  {group.links.map(({ label, id }) => (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        onClick={(e) => handleClick(e, id)}
                        className={`block border-l-2 py-1 pl-[18px] pr-5 text-[13px] leading-snug no-underline transition-all duration-200 ${
                          activeId === id
                            ? 'border-[var(--foreground)] font-medium text-[var(--foreground)]'
                            : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                        }`}
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </nav>

        <div className="flex-shrink-0 flex gap-4 border-t border-[rgba(0,0,0,0.05)] px-5 py-3 text-[13px]">
          <a href="/" className="text-[var(--muted)] no-underline hover:text-[var(--foreground)]">Home</a>
          <a href="https://github.com/ultramenid/fieldkit" className="text-[var(--muted)] no-underline hover:text-[var(--foreground)]">GitHub</a>
        </div>
      </aside>
    </>
  )
}
