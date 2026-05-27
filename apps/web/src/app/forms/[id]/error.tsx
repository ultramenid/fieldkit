'use client'

import Link from 'next/link'

export default function FormError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--bg)] px-6">
      <div className="text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Error</p>
        <h1 className="mb-3 font-sans text-[28px] font-medium text-[var(--fg)]">Something went wrong</h1>
        <p className="mb-6 text-[15px] text-[var(--muted)]">Failed to load this form. Please try again.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full border border-[var(--fg)] bg-[var(--fg)] px-5 py-2.5 text-[14px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-[14px] font-medium text-[var(--fg)] no-underline transition-colors hover:border-[var(--fg)]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
