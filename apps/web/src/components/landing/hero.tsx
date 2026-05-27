import Link from 'next/link'

export function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden px-6 pb-[72px] pt-[80px] text-center max-sm:pb-12 max-sm:pt-14"
      style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* fade the dot grid out toward the edges and bottom */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, transparent 40%, white 100%)' }} />
      <div className="relative mx-auto max-w-[520px]">
      <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 font-mono text-[11px] text-[var(--muted)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--foreground)]" />
        Built for field teams
      </span>
      <h1 className="mb-4 font-sans text-[60px] font-medium leading-[1.05] tracking-tight text-[var(--foreground)] max-sm:text-[38px]">
        Build forms online,<br className="max-sm:hidden" /> collect data anywhere
      </h1>
      <p className="mx-auto mb-8 max-w-[42ch] text-[17px] leading-relaxed text-[var(--muted)]">
        Create rich forms in the cloud, deploy them to local networks for offline data collection.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-[15px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
        >
          Get started
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-6 py-3 text-[15px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
        >
          Read docs
        </Link>
      </div>
      <p className="mt-6 font-mono text-[11px] text-[var(--muted)]">
        Free to self-host&nbsp;&nbsp;·&nbsp;&nbsp;Works offline&nbsp;&nbsp;·&nbsp;&nbsp;Open source
      </p>
      </div>
    </section>
  )
}
