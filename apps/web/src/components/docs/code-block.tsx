export function CodeBlock({ lang, children }: { lang?: string; children: React.ReactNode }) {
  return (
    <div className="relative mb-4 max-w-[640px] overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[var(--surface)] pl-4 pr-[18px] py-3.5">
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-[var(--border)]" />
      {lang ? (
        <span className="absolute right-3 top-2 font-mono text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--muted-light)]">
          {lang}
        </span>
      ) : null}
      <pre className="m-0 whitespace-pre font-mono text-[13px] leading-[1.7] text-[var(--foreground)]">
        <code>{children}</code>
      </pre>
    </div>
  )
}
