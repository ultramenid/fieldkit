export function InstallSnippet() {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm max-sm:grid-cols-1">
      <div className="rounded-[12px] border border-neutral-200 p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Quick install
        </p>
        <code className="font-mono text-[13px] text-black">
          npm install -g @fieldkit/local-server
        </code>
      </div>
      <div className="rounded-[12px] border border-neutral-200 p-5">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-neutral-500">
          Start serving
        </p>
        <code className="font-mono text-[13px] text-black">fieldkit serve</code>
        <p className="mt-2 text-[12px] text-neutral-500">
          Then open the admin panel to import configs via the web UI.
        </p>
      </div>
    </div>
  )
}
