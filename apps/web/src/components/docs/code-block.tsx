export function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4">
      <pre className="m-0 whitespace-pre font-mono text-[13px] leading-relaxed text-[var(--foreground)] [&_.comment]:text-[var(--muted)] [&_.cmd]:text-[var(--accent)]">
        <code>{children}</code>
      </pre>
    </div>
  )
}
