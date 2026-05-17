export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Quick install
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">
          npm install -g @fieldkit/local-server
        </code>
      </div>
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Start serving
        </p>
        <code className="font-mono text-[13px] text-[var(--foreground)]">fieldkit serve</code>
        <p className="mt-2 text-[12px] text-[var(--muted)]">
          Then open the admin panel to import configs via the web UI.
        </p>
      </div>
    </div>
  )
}
