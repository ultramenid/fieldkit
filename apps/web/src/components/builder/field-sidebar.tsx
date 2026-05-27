'use client'

import { useBuilder } from '@/lib/builder-context'
import type { FieldType } from '@fieldkit/form-schema'

const FIELD_TYPES: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  {
    type: 'text',
    label: 'Text input',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
      </svg>
    ),
  },
  {
    type: 'email',
    label: 'Email',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 7l-10 6L2 7" />
      </svg>
    ),
  },
  {
    type: 'number',
    label: 'Number',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />
      </svg>
    ),
  },
  {
    type: 'textarea',
    label: 'Long text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M21 13V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8" />
        <path d="M7 7h10M7 11h6M7 15h4" />
      </svg>
    ),
  },
  {
    type: 'select',
    label: 'Dropdown',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M6 9l6 6 6-6" />
      </svg>
    ),
  },
  {
    type: 'radio',
    label: 'Single choice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" fill="currentColor" />
      </svg>
    ),
  },
  {
    type: 'checkbox',
    label: 'Multiple choice',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="3" width="18" height="18" rx="3" /><path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    type: 'date',
    label: 'Date',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </svg>
    ),
  },
  {
    type: 'file',
    label: 'Image upload',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6" />
      </svg>
    ),
  },
  {
    type: 'rating',
    label: 'Rating',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    type: 'richtext',
    label: 'Rich text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M4 6h16M4 12h10M4 18h14" />
        <path d="M15 10l5 2-5 2v-4z" />
      </svg>
    ),
  },
]

export function FieldSidebar() {
  const { dispatch } = useBuilder()

  return (
    <aside className="overflow-y-auto border-r border-[var(--border)] p-5">
      <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
        Field types
      </h3>
      <div className="flex flex-col gap-1">
        {FIELD_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            onClick={() => dispatch({ type: 'ADD_FIELD', fieldType: type })}
            className="group flex w-full items-center gap-2.5 rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-left text-[14px] text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] hover:bg-[var(--surface)]"
          >
            <span className="h-[18px] w-[18px] flex-shrink-0 text-[var(--muted)] transition-colors group-hover:text-[var(--accent)] [&>svg]:h-full [&>svg]:w-full">
              {icon}
            </span>
            {label}
          </button>
        ))}
      </div>
    </aside>
  )
}
