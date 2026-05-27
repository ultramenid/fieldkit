import { Nav } from '@/components/landing/nav'
import { Hero } from '@/components/landing/hero'
import { ScreenCard } from '@/components/landing/screen-card'
import { WorkflowStrip } from '@/components/landing/workflow-strip'
import { InstallSnippet } from '@/components/landing/install-snippet'
import Link from 'next/link'

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
    href: '/docs#installation',
    title: 'Installation Guide',
    description: 'Install via npm on Windows, macOS, or Linux. One command to get started.',
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
    href: '/docs#importing-and-serving',
    title: 'Response Data Sync',
    description: 'Export collected responses from the local server and import them into the dashboard.',
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

const mobileCards = [
  {
    href: '/docs#mobile-app',
    title: 'Offline Forms',
    description: 'Download form configs via QR scan or server URL and fill out completely offline',
    tag: 'Mobile',
    tagVariant: 'mobile' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    href: '/docs#mobile-app',
    title: 'Camera & File Upload',
    description: 'Attach photos, documents, and files directly from your device camera or storage',
    tag: 'Mobile',
    tagVariant: 'mobile' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    href: '/docs#syncing-responses',
    title: 'Background Sync',
    description: 'Responses queue locally and sync automatically once internet is available',
    tag: 'Mobile',
    tagVariant: 'mobile' as const,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21.5 2v6h-6M2.5 22v-6h6" />
        <path d="M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" />
      </svg>
    ),
  },
]

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="mb-1 font-sans text-[22px] font-medium text-[var(--foreground)]">{title}</h2>
      <p className="text-[14px] text-[var(--muted)]">{subtitle}</p>
    </div>
  )
}

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <Hero />

      <main className="mx-auto w-full max-w-[960px] px-6 pb-24">

        {/* Serverside */}
        <section className="py-10">
          <SectionHeader
            title="The platform"
            subtitle="Build forms, share links, and watch responses come in live"
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {serverCards.map((card) => (
              <ScreenCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <div className="border-t border-[var(--border)]" />

        {/* Local server */}
        <section className="py-10">
          <SectionHeader
            title="Local server"
            subtitle="Run on any machine on your LAN — no internet required to collect data"
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {localCards.map((card) => (
              <ScreenCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <div className="border-t border-[var(--border)]" />

        {/* Mobile */}
        <section className="py-10">
          <SectionHeader
            title="Mobile app"
            subtitle="Download forms, collect offline, sync when back online"
          />
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
            {mobileCards.map((card) => (
              <ScreenCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <div className="border-t border-[var(--border)]" />

        {/* How it works */}
        <section className="py-10">
          <SectionHeader
            title="How it works"
            subtitle="Single pipeline — build online, pick an import path, collect offline, sync when ready"
          />
          <WorkflowStrip />
        </section>

        <div className="border-t border-[var(--border)]" />

        {/* Quick start */}
        <section className="py-10">
          <SectionHeader
            title="Quick start"
            subtitle="Up and running in two commands"
          />
          <InstallSnippet />
        </section>

      </main>

      <footer className="mt-auto border-t border-[var(--border)] px-6 pt-10 pb-8">
        <div className="mx-auto max-w-[960px]">
          <div className="flex flex-wrap justify-between gap-10 max-sm:flex-col">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <img src="/logo.png" alt="FieldKit" className="h-5 w-5" />
                <span className="font-sans text-[15px] font-medium text-[var(--foreground)]">FieldKit</span>
              </div>
              <p className="max-w-[22ch] text-[13px] text-[var(--muted)]">Built for field teams collecting data offline.</p>
            </div>
            <div className="flex gap-16 max-sm:gap-10">
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Product</p>
                <ul className="flex flex-col gap-2">
                  {[
                    { label: 'Dashboard', href: '/dashboard' },
                    { label: 'Form Builder', href: '/forms/new' },
                    { label: 'Local Server', href: '/docs#local-server' },
                    { label: 'Mobile App', href: '/docs#mobile-app' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Resources</p>
                <ul className="flex flex-col gap-2">
                  {[
                    { label: 'Docs', href: '/docs' },
                    { label: 'Quick start', href: '/docs#installation' },
                    { label: 'API reference', href: '/docs#api-reference' },
                    { label: 'GitHub', href: 'https://github.com' },
                  ].map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="text-[13px] text-[var(--muted)] transition-colors hover:text-[var(--foreground)]">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-[var(--border)] pt-6">
            <p className="font-mono text-[11px] text-[var(--muted)]">© 2026 FieldKit · Built for field teams</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
