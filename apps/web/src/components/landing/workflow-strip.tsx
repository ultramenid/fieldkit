export function WorkflowStrip() {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] px-4 py-5">
      <div className="flex flex-col items-center gap-2.5">
        <span className="whitespace-nowrap rounded-full border border-[#16a34a]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#16a34a]">
          Build form online
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[var(--border)] px-[14px] py-1.5 text-[13px] font-medium text-[var(--foreground)]">
          Export config
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="w-full max-w-[380px] rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-3">
          <span className="mb-2.5 block text-center font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
            Choose import path
          </span>
          <span className="grid gap-2">
            <span className="whitespace-nowrap rounded-full border border-[#f59e0b]/30 px-[14px] py-1.5 text-center text-[13px] font-medium text-[#b45309]">
              Local server package
            </span>
            <span className="whitespace-nowrap rounded-full border border-[#2563eb]/30 px-[14px] py-1.5 text-center text-[13px] font-medium text-[#2563eb]">
              Scan QR on mobile
            </span>
          </span>
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[#f59e0b]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#b45309]">
          Collect offline
        </span>
        <span className="text-[13px] leading-none text-[var(--muted)]">↓</span>
        <span className="whitespace-nowrap rounded-full border border-[#16a34a]/30 px-[14px] py-1.5 text-[13px] font-medium text-[#16a34a]">
          Sync responses
        </span>
      </div>
      <p className="mx-auto mt-2.5 max-w-[560px] text-center text-[12px] text-[var(--muted)]">
        Single pipeline: build online, pick one import path, collect offline, then sync when internet is available.
      </p>
    </div>
  )
}
