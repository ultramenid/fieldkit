'use client'

import type { BuilderField } from '@/lib/builder-types'

interface FieldItemProps {
  field: BuilderField
  isSelected: boolean
  onSelect: () => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
}

function FieldPreview({ field }: { field: BuilderField }) {
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
          {options.map((o) => <option key={o}>{o}</option>)}
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

export function FieldItem({ field, isSelected, onSelect, onPointerDown }: FieldItemProps) {
  return (
    <div
      data-field-id={field.id}
      onPointerDown={onPointerDown}
      onClick={onSelect}
      className={`relative cursor-grab rounded-[12px] border-2 p-4 transition-colors active:cursor-grabbing ${
        isSelected
          ? 'border-[var(--foreground)]'
          : 'border-transparent hover:border-[var(--border)] hover:bg-[var(--surface)]'
      }`}
    >
      {/* Drag handle */}
      <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 cursor-grab select-none p-1 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100 [.form-field-item:hover_&]:opacity-100">
        ⠿
      </span>

      {/* Label */}
      <label className="mb-1.5 block text-[14px] font-medium text-[var(--foreground)] pointer-events-none">
        {field.label}
        {field.required && <span className="ml-0.5 text-[#dc2626]">*</span>}
      </label>

      {/* Field preview */}
      <FieldPreview field={field} />

      {/* Help text */}
      {field.helpText && (
        <p className="mt-1.5 text-[12px] text-[var(--muted)]">{field.helpText}</p>
      )}
    </div>
  )
}
