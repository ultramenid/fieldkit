function InfoIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.5v4" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

function TipIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <path d="M8 2c-2 1.5-4.5 3-4.5 6 0 2 1 3.5 2.5 4v1a1 1 0 001 1h2a1 1 0 001-1v-1c1.5-.5 2.5-2 2.5-4 0-3-2.5-4.5-4.5-6z" />
      <path d="M7.5 2.5v-1a.5.5 0 01.5-.5h0a.5.5 0 01.5.5v1" strokeLinecap="round" />
      <line x1="6" y1="7" x2="10" y2="7" strokeLinecap="round" />
      <line x1="8" y1="9" x2="8" y2="9" strokeLinecap="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4 flex-shrink-0 text-[var(--muted-light)]">
      <path d="M8 2L1.5 13.5h13L8 2z" strokeLinejoin="round" />
      <path d="M8 6.5v2.5" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

const icons = {
  info: InfoIcon,
  tip: TipIcon,
  warning: WarningIcon,
}

export function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warning'; children: React.ReactNode }) {
  const Icon = icons[type]
  return (
    <div className="mb-4 flex max-w-[640px] gap-3 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-[18px] py-3.5 text-[13px] text-[var(--muted)] [&_strong]:font-semibold [&_strong]:text-[var(--foreground)]">
      <div className="mt-px"><Icon /></div>
      <div className="text-[13px] leading-relaxed text-[var(--muted)] [&_p]:m-0 [&_strong]:font-semibold [&_strong]:text-[var(--foreground)]">
        {children}
      </div>
    </div>
  )
}
