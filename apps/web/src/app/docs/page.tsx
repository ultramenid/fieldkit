'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const navGroups = [
  {
    title: 'Overview',
    items: [{ id: 'introduction', label: 'Introduction' }],
  },
  {
    title: 'Serverside',
    items: [
      { id: 'serverside', label: 'Platform overview' },
      { id: 'serverside-create', label: 'Creating a form' },
      { id: 'serverside-share', label: 'Sharing & publishing' },
      { id: 'serverside-responses', label: 'Responses' },
      { id: 'serverside-export', label: 'Exporting config' },
    ],
  },
  {
    title: 'Local Server',
    items: [
      { id: 'localserver', label: 'Overview' },
      { id: 'localserver-install', label: 'Installation' },
      { id: 'localserver-import', label: 'Importing & serving' },
      { id: 'localserver-data', label: 'Exporting data' },
      { id: 'localserver-network', label: 'Network setup' },
    ],
  },
  {
    title: 'Mobile',
    items: [
      { id: 'mobile-overview', label: 'Overview' },
      { id: 'mobile-import', label: 'Importing a form' },
      { id: 'collecting', label: 'Collecting responses' },
      { id: 'syncing', label: 'Syncing responses' },
      { id: 'delete', label: 'Deleting a form' },
    ],
  },
]

function Step({ num, title, body }: { num: number; title: string; body: string }) {
  return (
    <div className="mb-5 flex max-w-[600px] gap-4">
      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] font-mono text-[11px] text-[var(--muted)]">
        {num}
      </div>
      <div>
        <p className="m-0 mb-1 text-[14px] font-semibold">{title}</p>
        <p className="m-0 text-[13px] leading-relaxed text-[var(--muted)]">{body}</p>
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mb-5 mt-1 max-w-[600px] overflow-x-auto rounded-xl bg-[#0a0a0a] px-5 py-4 font-mono text-[13px] leading-relaxed text-[#e5e5e5]">
      {children}
    </pre>
  )
}

function InlineCode({ children }: { children: string }) {
  return (
    <code className="rounded border border-[var(--border)] bg-[var(--surface)] px-1 py-0.5 font-mono text-[11px]">
      {children}
    </code>
  )
}

function Sec({
  id,
  title,
  children,
}: {
  id: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-14 scroll-mt-12">
      <hr className="mb-6 border-t border-[var(--border)]" />
      {title && <h2 className="m-0 mb-4 text-[20px] font-semibold leading-snug">{title}</h2>}
      <div className="max-w-[600px] text-[14px] leading-[1.7]">{children}</div>
    </section>
  )
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState('introduction')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const ids = navGroups.flatMap((g) => g.items.map((i) => i.id))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id)
        }
      },
      { rootMargin: '-10% 0px -80% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function go(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <div className="min-h-dvh bg-[var(--background)] text-[var(--foreground)]">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--background)] md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          className="h-4 w-4"
        >
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-[rgba(0,0,0,0.06)] bg-[var(--background)] transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="relative flex-shrink-0 px-5 pt-5">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline text-[var(--foreground)]"
          >
            <img src="/logo.png" alt="" className="h-6 w-6" />
            <span className="text-[15px] font-semibold">FieldKit Docs</span>
          </Link>

          {/* Close button - mobile only */}
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-4 w-4">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--muted)]">
                {group.title}
              </p>
              <ul className="m-0 list-none p-0">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => go(item.id)}
                      className={`w-full rounded-lg border-l-2 px-2 py-1.5 text-left text-[13px] transition-colors ${
                        activeId === item.id
                          ? 'border-l-[var(--accent)] bg-[var(--accent-soft)] font-medium text-[var(--accent)]'
                          : 'border-l-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-shrink-0 gap-5 border-t border-[var(--border)] px-5 py-3">
          <Link
            href="/"
            className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Home
          </Link>
          <a
            href="https://github.com/ultramenid/fieldkit"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
        </div>
      </aside>

      {/* Main content */}
      <main className="px-6 pb-24 pt-12 md:ml-[260px] md:px-14 max-w-[860px]">
        {/* Introduction */}
        <section id="introduction" className="mb-14 scroll-mt-12">
          <h1 className="m-0 mb-2 text-[32px] font-bold tracking-tight">Documentation</h1>
          <p className="m-0 text-[15px] text-[var(--muted)]">
            Build forms online, distribute them offline, collect responses in the field.
          </p>
        </section>

        {/* Serverside platform */}
        <Sec id="serverside" title="Serverside platform">
          <p className="mb-0">
            The serverside web app is where you create and manage forms, view live responses, and
            export config files for offline use. Sign in with Google to get started.
          </p>
        </Sec>

        {/* Creating a form */}
        <Sec id="serverside-create" title="Creating a form">
          <p className="mb-5">
            From the dashboard, click <strong>New Form</strong>. The builder opens with a
            drag-and-drop canvas.
          </p>
          <Step
            num={1}
            title="Add fields"
            body="Pick a field type from the left panel. Drag fields to reorder them on the canvas."
          />
          <Step
            num={2}
            title="Configure each field"
            body="Click a field to open its settings — label, placeholder, help text, required toggle, and validation rules."
          />
          <Step
            num={3}
            title="Save"
            body="Changes save automatically. The form version increments on each save and is reflected in any exported configs."
          />
          <p className="mb-0 text-[13px] text-[var(--muted)]">
            The same form config works identically on web, local server, and mobile.
          </p>
        </Sec>

        {/* Sharing */}
        <Sec id="serverside-share" title="Sharing & publishing">
          <p className="mb-5">
            Open a form and click <strong>Share</strong> to access all distribution options.
          </p>
          <Step
            num={1}
            title="Copy link"
            body="Send the public URL to respondents. They fill the form in any browser — no account needed."
          />
          <Step
            num={2}
            title="Embed"
            body="Paste the embed snippet into any webpage to show the form inline."
          />
          <Step
            num={3}
            title="QR code"
            body="Display the QR code on screen — mobile users scan it to import the form directly to their device."
          />
        </Sec>

        {/* Responses */}
        <Sec id="serverside-responses" title="Responses">
          <p className="mb-3">
            The responses table updates in real time — new submissions appear instantly via
            server-sent events, no refresh needed.
          </p>
          <p className="mb-3">
            Filter by source (online / mobile / local server), import a JSON export from a local
            server, or download the full dataset as CSV or JSON.
          </p>
          <p className="mb-0 text-[13px] text-[var(--muted)]">
            Duplicate submissions (e.g. from retried syncs) are automatically deduplicated by{' '}
            <InlineCode>submissionId</InlineCode>.
          </p>
        </Sec>

        {/* Exporting config */}
        <Sec id="serverside-export" title="Exporting a form config">
          <p className="mb-5">
            The config JSON is the bridge to the offline world. It bundles the full form definition
            with a unique secret that authenticates synced responses.
          </p>
          <Step num={1} title="Open Share" body="From the form page, click Share." />
          <Step
            num={2}
            title="Download config"
            body='Click "Download config" — a .json file saves to your device.'
          />
          <Step
            num={3}
            title="Distribute"
            body="Import the file into the local server admin UI, or use the QR code to import directly into the mobile app."
          />
        </Sec>

        {/* Local server overview */}
        <Sec id="localserver" title="Local server overview">
          <p className="mb-0">
            The local server runs on any laptop or field machine. It hosts your form over Wi-Fi so
            anyone on the same network can submit responses without internet. Collected data is
            exported and merged into the serverside when connectivity is available.
          </p>
        </Sec>

        {/* Installation */}
        <Sec id="localserver-install" title="Installation">
          <p className="mb-3">Requires Node.js 18+. Install once globally:</p>
          <CodeBlock>npm install -g @malichamdan/fieldkit-local-server</CodeBlock>
          <p className="mb-3">Confirm it&apos;s working:</p>
          <CodeBlock>fieldkit --version</CodeBlock>
        </Sec>

        {/* Importing & serving */}
        <Sec id="localserver-import" title="Importing & serving">
          <Step
            num={1}
            title="Start the server"
            body="Run fieldkit in your terminal. The admin UI opens at http://localhost:3000."
          />
          <CodeBlock>fieldkit</CodeBlock>
          <Step
            num={2}
            title="Open the admin panel"
            body="Navigate to the local URL. On other devices, replace localhost with the machine's IP (e.g. http://192.168.1.5:3000)."
          />
          <Step
            num={3}
            title="Import config"
            body='Drag the .json config file into the "Import Config" area, or click to browse your files.'
          />
          <Step
            num={4}
            title="Form is live"
            body="Any device on the same Wi-Fi can open the form and submit a response."
          />
        </Sec>

        {/* Exporting data */}
        <Sec id="localserver-data" title="Exporting collected data">
          <p className="mb-3">
            In the admin UI, go to <strong>Responses</strong> and click <strong>Export</strong>.
            Choose CSV or JSON.
          </p>
          <p className="mb-0 text-[13px] text-[var(--muted)]">
            To merge local responses with the serverside table, open the responses page on the
            serverside and use <strong>Import</strong> to upload the exported JSON file.
          </p>
        </Sec>

        {/* Network setup */}
        <Sec id="localserver-network" title="Network setup">
          <p className="mb-3">
            The local server binds to all interfaces by default, so other devices on the same Wi-Fi
            automatically have access.
          </p>
          <p className="mb-0">
            If your OS prompts for a firewall exception, allow it. On corporate networks with client
            isolation, use a personal hotspot instead.
          </p>
        </Sec>

        {/* Mobile overview */}
        <Sec id="mobile-overview" title="Mobile app overview">
          <p className="mb-0">
            The FieldKit mobile app lets you scan a form config, collect responses completely
            offline, and sync them back to the serverside when you have internet. Available for iOS
            and Android.
          </p>
        </Sec>

        {/* Importing a form */}
        <Sec id="mobile-import" title="Importing a form">
          <p className="mb-5">Two ways to add a form to the mobile app:</p>
          <Step
            num={1}
            title="Scan QR code"
            body="In the serverside Share modal, display the QR code. In the app, tap the scan button and point your camera at it."
          />
          <Step
            num={2}
            title="Enter config URL"
            body="Tap Add Form, choose Enter URL, and paste the config URL from the Share modal."
          />
        </Sec>

        {/* Collecting */}
        <Sec id="collecting" title="Collecting responses">
          <p className="mb-3">
            Open a form from your list, fill in the fields, and tap Submit. The response saves to
            the phone immediately — no internet required.
          </p>
          <p className="mb-0 text-[13px] text-[var(--muted)]">
            Multiple responses from different people can be collected on the same device. Each
            submission receives a unique ID for deduplication on sync.
          </p>
        </Sec>

        {/* Syncing */}
        <Sec id="syncing" title="Syncing responses">
          <p className="mb-5">
            Responses sync automatically when the device comes online. Manual sync options:
          </p>
          <Step
            num={1}
            title="Sync one form"
            body="Tap the sync icon on a form card to push its pending responses."
          />
          <Step
            num={2}
            title="Sync all"
            body='Tap "Sync All" at the top of the forms list to upload everything at once.'
          />
          <p className="mb-0 text-[13px] text-[var(--muted)]">
            Synced responses appear in the serverside table instantly.
          </p>
        </Sec>

        {/* Delete */}
        <Sec id="delete" title="Deleting a form">
          <p className="mb-0">
            Tap and hold a form card, then tap <strong>Delete</strong>. This removes the form and
            all its unsynced local responses from the device. Responses already synced to the
            serverside are unaffected.
          </p>
        </Sec>
      </main>
    </div>
  )
}
