export function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <p className="mb-2 font-mono text-[13px] font-medium uppercase tracking-[0.04em] text-[var(--muted)]">
        {title}
      </p>
      <div className="text-[14px] text-[var(--foreground)]">{children}</div>
    </div>
  )
}
