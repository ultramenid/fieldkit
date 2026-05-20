export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Install local server
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">
          npm install -g @malichamdan/fieldkit-local-server
        </code>
      </div>
      <div className="rounded-[12px] border border-[var(--border)] p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Start serving
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">fieldkit</code>
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          Then import configs via admin panel or scan QR with mobile client
        </p>
      </div>
    </div>
  )
}
