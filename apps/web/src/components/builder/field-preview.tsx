'use client'

import { resolveRichTextFeatures } from '@fieldkit/form-schema'
import type { BuilderField } from '@/lib/builder-types'

export function FieldPreview({ field }: { field: BuilderField }) {
  const inputClass =
    'w-full rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-[14px] text-[var(--muted)] pointer-events-none'
  const options = field.options ?? ['Option 1', 'Option 2', 'Option 3']

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder ?? 'Enter value…'}
          disabled
          className={inputClass}
        />
      )
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder ?? 'Enter text…'}
          disabled
          className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--background)] px-3.5 py-2.5 text-[14px] text-[var(--muted)] pointer-events-none min-h-[80px] resize-none"
        />
      )
    case 'richtext':
      const features = resolveRichTextFeatures(field.editorFeatures)
      const toolbarItems: string[] = []
      const toolbarDropdowns: string[] = []
      if (features.bold) toolbarItems.push('B')
      if (features.italic) toolbarItems.push('I')
      if (features.underline) toolbarItems.push('U')
      if (features.highlight) toolbarItems.push('H')
      if (features.lists) toolbarDropdowns.push('List')
      if (features.blockquote) toolbarItems.push('❝')
      if (features.codeBlock) toolbarItems.push('</>')
      if (features.link) toolbarItems.push('Link')
      if (features.align) toolbarDropdowns.push('Align')
      if (features.image) toolbarItems.push('Img')
      return (
        <div className="pointer-events-none overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--background)]">
          <div className="flex flex-wrap gap-1.5 border-b border-[var(--border)] bg-[var(--surface)] px-2.5 py-2">
            {toolbarDropdowns.map((label) => (
              <span
                key={label}
                className="inline-flex h-7 items-center rounded-full border border-[var(--border)] bg-[var(--background)] pl-2.5 pr-2 text-[11px] text-[var(--muted)]"
              >
                {label}
                <svg className="ml-1.5 h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            ))}
            {toolbarItems.map((label, index) => (
              <span
                key={`${label}-${index}`}
                className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-full border border-[var(--border)] bg-[var(--background)] px-2 text-[10px] font-medium text-[var(--muted)]"
              >
                {label}
              </span>
            ))}
            {toolbarItems.length === 0 && toolbarDropdowns.length === 0 && (
              <span className="text-[11px] text-[var(--muted)]">No toolbar actions enabled</span>
            )}
          </div>
          <div className="min-h-[80px] px-3.5 py-2.5 text-[14px] text-[var(--muted)]">
            {field.placeholder ?? 'Respondent rich text editor'}
          </div>
        </div>
      )
    case 'select':
      return (
        <select
          disabled
          className={inputClass}
          style={{
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '36px',
          }}
        >
          <option>Select an option…</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      )
    case 'radio':
      return (
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 text-[14px] text-[var(--foreground)] pointer-events-none">
              <input type="radio" disabled className="h-4 w-4" />
              {o}
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="flex flex-col gap-2">
          {options.map((o) => (
            <label key={o} className="flex items-center gap-2 text-[14px] text-[var(--foreground)] pointer-events-none">
              <input type="checkbox" disabled className="h-4 w-4 rounded" />
              {o}
            </label>
          ))}
        </div>
      )
    case 'file':
      return (
        <div className="rounded-[12px] border-2 border-dashed border-[var(--border)] p-6 text-center text-[13px] text-[var(--muted)]">
          Drop image here or click to upload
        </div>
      )
    case 'rating':
      return (
        <div className="flex gap-1 text-[24px] text-[var(--border)]">★★★★★</div>
      )
    default:
      return null
  }
}
