import { Nav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { ScreenCard } from '@/components/landing/screen-card'
import { WorkflowStrip } from '@/components/landing/workflow-strip'
import { InstallSnippet } from '@/components/landing/install-snippet'

const serverCards = [
  {
    href: '/dashboard',
    title: 'Dashboard',
    description: 'View all forms, stats, share links, and export configurations',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/forms/new',
    title: 'Form Builder',
    description: 'Drag-and-drop editor with field types, validation, and settings',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 3v18M3 12h18" />
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
  },
  {
    href: '/dashboard',
    title: 'Live Responses',
    description: 'Real-time table with filtering, import from local servers, and CSV export',
    tag: 'Serverside',
    tagVariant: 'server' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18M3 15h18M9 3v18" />
      </svg>
    ),
  },
]

const localCards = [
  {
    href: '/docs#local-server',
    title: 'Local Server Admin',
    description: 'Manage imported forms, start/stop server, monitor connected devices, and export collected data',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    href: '/docs#install',
    title: 'Installation Guide',
    description: 'Install via npm on Windows, macOS, or Linux. Docker image also available.',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
        <path d="M8 7h8M8 11h6" />
      </svg>
    ),
  },
  {
    href: '/docs#sync',
    title: 'Response Data Sync',
    description: 'Export collected responses from local server and import into serverside to compile into one table.',
    tag: 'Localserver',
    tagVariant: 'local' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M17 1l4 4-4 4" />
        <path d="M3 11V9a4 4 0 014-4h14" />
        <path d="M7 23l-4-4 4-4" />
        <path d="M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
  },
]

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <Hero />
      <main className="mx-auto w-full max-w-[960px] px-6 pb-20">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Serverside
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {serverCards.map((card) => (
            <ScreenCard key={card.title} {...card} />
          ))}
        </div>

        <hr className="my-10 border-t border-[var(--border)]" />

        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Localserver
        </p>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {localCards.map((card) => (
            <ScreenCard key={card.title} {...card} />
          ))}
        </div>

        <hr className="my-10 border-t border-[var(--border)]" />

        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          How it works
        </p>
        <div className="mb-6">
          <WorkflowStrip />
        </div>
        <InstallSnippet />
      </main>
      <footer className="mt-auto border-t border-[var(--border)] px-6 py-6 text-center text-[13px] text-[var(--muted)]">
        FieldKit · Built for field teams
      </footer>
    </div>
  )
}
