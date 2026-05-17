import React from 'react'

const steps = [
  { label: 'Build form online', variant: 'green' as const },
  { label: 'Export config', variant: 'default' as const },
  { label: 'Import to local', variant: 'amber' as const },
  { label: 'Collect offline', variant: 'amber' as const },
  { label: 'Sync responses', variant: 'green' as const },
]

const stepClass = {
  green: 'border-[#16a34a]/60 text-[#16a34a]',
  amber: 'border-[#b45309]/60 text-[#b45309]',
  default: 'border-[var(--border)] text-[var(--foreground)]',
}

export function WorkflowStrip() {
  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-center justify-center gap-2.5 text-[13px] font-medium">
        {steps.map((step, i) => (
          <React.Fragment key={step.label}>
            <span
              className={`whitespace-nowrap rounded-full border px-[14px] py-1.5 ${stepClass[step.variant]}`}
            >
              {step.label}
            </span>
            {i < steps.length - 1 && (
              <span className="text-[11px] text-[var(--muted)]">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
      <p className="mt-3 text-center text-[12px] text-[var(--muted)]">
        No internet required during data collection. Works on any local network.
      </p>
    </div>
  )
}
