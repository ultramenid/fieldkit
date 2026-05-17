import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6">
      <div className="text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">404</p>
        <h1 className="mb-3 font-sans text-[28px] font-medium text-[var(--fg)]">Page not found</h1>
        <p className="mb-6 text-[15px] text-[var(--muted)]">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="rounded-full border border-[var(--fg)] bg-[var(--fg)] px-5 py-2.5 text-[14px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80 no-underline"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
