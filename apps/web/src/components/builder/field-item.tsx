'use client'

import type { BuilderField } from '@/lib/builder-types'
import { FieldPreview } from '@/components/builder/field-preview'

interface FieldItemProps {
  field: BuilderField
  isSelected: boolean
  onSelect: () => void
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
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
      <span className="absolute left-[-4px] top-1/2 -translate-y-1/2 cursor-grab select-none p-1 text-[var(--muted)] opacity-0 transition-opacity group-hover:opacity-100 [.form-field-item:hover_&]:opacity-100">
        ⠿
      </span>

      <label className="mb-1.5 block text-[14px] font-medium text-[var(--foreground)] pointer-events-none">
        {field.label}
        {field.required && <span className="ml-0.5 text-[#dc2626]">*</span>}
      </label>

      {field.helpText && (
        <p className="mb-2 text-[12px] text-[var(--muted)] pointer-events-none">{field.helpText}</p>
      )}

      <FieldPreview field={field} />
    </div>
  )
}
