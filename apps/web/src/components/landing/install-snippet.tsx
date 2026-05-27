export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Install local server
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">
          <span className="mr-2 select-none text-[var(--muted)]">$</span>npm install -g @malichamdan/fieldkit-local-server
        </code>
      </div>
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Start serving
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">
          <span className="mr-2 select-none text-[var(--muted)]">$</span>fieldkit serve
        </code>
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          Then import configs via the admin panel or scan QR with the mobile app
        </p>
      </div>
    </div>
  )
}
