export function WorkflowStrip() {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-8 py-8">
      <div className="flex flex-col items-center gap-2.5">
        <span className="whitespace-nowrap rounded-full border border-[#16a34a]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#16a34a]">
          Build form online
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[var(--border)] px-[14px] py-1.5 text-[13px] font-medium text-[var(--foreground)]">
          Export config
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <div className="w-full max-w-[480px] rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-4">
          <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            Choose import path
          </p>
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <span className="rounded-full border border-[#f59e0b]/30 px-[14px] py-1.5 text-center text-[13px] font-medium text-[#b45309]">
              Local server package
            </span>
            <span className="rounded-full border border-[#2563eb]/30 px-[14px] py-1.5 text-center text-[13px] font-medium text-[#2563eb]">
              Scan QR on mobile
            </span>
          </div>
        </div>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[#f59e0b]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#b45309]">
          Collect offline
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[#16a34a]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#16a34a]">
          Sync responses
        </span>
      </div>
    </div>
  )
}
