'use client'

import { useState, useEffect } from 'react'
import type { BuilderField } from '@/lib/builder-types'

interface FormViewProps {
  formId: string
  title: string
  description: string
  fields: BuilderField[]
  submitButtonText?: string
  confirmationMessage?: string
  isPreview?: boolean
  isClosed?: boolean
  allowMultipleSubmissions?: boolean
}

function FieldInput({ field, value, onChange }: {
  field: BuilderField
  value: string | string[] | number | null
  onChange: (val: string | string[] | number | null) => void
}) {
  const inputClass = 'w-full rounded-full border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[15px] text-[var(--fg)] transition-colors focus:border-[var(--fg)] focus:outline-none'

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'date':
      return (
        <input
          type={field.type}
          placeholder={field.placeholder ?? ''}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
        />
      )
    case 'textarea':
      return (
        <textarea
          placeholder={field.placeholder ?? ''}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full rounded-[12px] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[15px] text-[var(--fg)] transition-colors focus:border-[var(--fg)] focus:outline-none min-h-[100px] resize-vertical"
        />
      )
    case 'select':
      return (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className={inputClass}
          style={{
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23737373' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 14px center',
            paddingRight: '40px',
          }}
        >
          <option value="">Select an option…</option>
          {(field.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )
    case 'radio':
      return (
        <div className="mt-1 flex flex-col gap-2.5">
          {(field.options ?? []).map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[var(--border)] px-[14px] py-2.5 text-[15px] transition-colors hover:border-[var(--fg)] hover:bg-[var(--surface)]">
              <input
                type="radio"
                name={field.id}
                value={o}
                checked={value === o}
                onChange={() => onChange(o)}
                className="h-[18px] w-[18px] accent-[var(--fg)]"
              />
              {o}
            </label>
          ))}
        </div>
      )
    case 'checkbox':
      return (
        <div className="mt-1 flex flex-col gap-2.5">
          {(field.options ?? []).map((o) => {
            const checked = Array.isArray(value) && value.includes(o)
            return (
              <label key={o} className="flex cursor-pointer items-center gap-2.5 rounded-full border border-[var(--border)] px-[14px] py-2.5 text-[15px] transition-colors hover:border-[var(--fg)] hover:bg-[var(--surface)]">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const arr = Array.isArray(value) ? [...value] : []
                    onChange(checked ? arr.filter((v) => v !== o) : [...arr, o])
                  }}
                  className="h-[18px] w-[18px] accent-[var(--fg)]"
                />
                {o}
              </label>
            )
          })}
        </div>
      )
    case 'rating': {
      const max = field.validation?.maxStars ?? 5
      const rating = (value as number) ?? 0
      return (
        <div className="mt-1 flex gap-1">
          {Array.from({ length: max }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i + 1)}
              className={`border-none bg-transparent p-1 text-[28px] transition-colors ${i < rating ? 'text-[var(--accent)]' : 'text-[var(--border)]'}`}
            >
              ★
            </button>
          ))}
        </div>
      )
    }
    case 'file':
      return (
        <div className="mt-1 cursor-pointer rounded-[12px] border-2 border-dashed border-[var(--border)] p-8 text-center transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface)]">
          <svg className="mx-auto mb-2 h-8 w-8 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-[14px] text-[var(--muted)]">Drop file here or click to upload</p>
          <span className="text-[12px] text-[var(--border)]">PDF, JPG, PNG up to 10MB</span>
        </div>
      )
    default:
      return null
  }
}

export function FormView({
  formId,
  title,
  description,
  fields,
  submitButtonText = 'Submit response',
  confirmationMessage = 'Thank you for your response.',
  isPreview = false,
  isClosed = false,
  allowMultipleSubmissions = false,
}: FormViewProps) {
  const storageKey = `fieldkit_submitted_${formId}`
  const [values, setValues] = useState<Record<string, string | string[] | number | null>>({})
  const [submitted, setSubmitted] = useState<boolean | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Check localStorage client-side only to avoid hydration mismatch
  useEffect(() => {
    if (!isPreview && !allowMultipleSubmissions && localStorage.getItem(storageKey)) {
      setSubmitted(true)
    } else {
      setSubmitted(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filledCount = fields.filter((f) => {
    const v = values[f.id]
    if (Array.isArray(v)) return v.length > 0
    return v !== null && v !== undefined && v !== ''
  }).length

  const progress = fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPreview) { setSubmitted(true); return }
    setSubmitting(true)
    const answers = fields.map((f) => ({ fieldId: f.id, value: values[f.id] ?? null }))
    await fetch(`/api/f/${formId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
    if (!allowMultipleSubmissions) {
      localStorage.setItem(storageKey, '1')
    }
    setSubmitting(false)
    setSubmitted(true)
  }

  // Wait for client-side localStorage check before rendering
  if (submitted === null) {
    return <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-12" />
  }

  if (isClosed) {
    return (
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">Closed</p>
        <h2 className="mb-2 font-sans text-[24px] font-medium text-[var(--fg)]">{title}</h2>
        <p className="text-[15px] text-[var(--muted)]">This form is no longer accepting responses.</p>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg)] p-12 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2 className="mb-2 font-sans text-[24px] font-medium text-[var(--fg)]">Response submitted</h2>
        <p className="mb-6 text-[15px] text-[var(--muted)]">{confirmationMessage}</p>
        {allowMultipleSubmissions && !isPreview && (
          <button
            onClick={() => { setValues({}); setSubmitted(false) }}
            className="rounded-full border border-[var(--fg)] bg-[var(--fg)] px-6 py-2.5 text-[14px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80"
          >
            Submit another response
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[12px] border border-[var(--border)] bg-[var(--bg)] px-12 py-12 max-sm:px-6 max-sm:py-8">
      <h1 className="mb-2 font-sans text-[28px] font-medium leading-tight text-[var(--fg)] max-sm:text-[22px]">{title}</h1>

      {/* Progress: percentage + thin bar */}
      {fields.length > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            {description && <p className="text-[15px] leading-relaxed text-[var(--muted)]">{description}</p>}
            <span className="ml-auto whitespace-nowrap font-mono text-[12px] text-[var(--muted)]">{progress}%</span>
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-[var(--fg)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {!fields.length && description && (
        <p className="mb-9 text-[15px] leading-relaxed text-[var(--muted)]">{description}</p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label className="text-[14px] font-medium text-[var(--fg)]">
              {field.label}
              {field.required && <span className="ml-0.5 text-[#dc2626]">*</span>}
            </label>
            {field.helpText && (
              <p className="text-[12px] text-[var(--muted)]">{field.helpText}</p>
            )}
            <FieldInput
              field={field}
              value={values[field.id] ?? null}
              onChange={(val) => setValues((prev) => ({ ...prev, [field.id]: val }))}
            />
          </div>
        ))}

        <div className="mt-2 flex items-center justify-between border-t border-[var(--border)] pt-7 max-sm:flex-col max-sm:gap-3">
          <button
            type="button"
            onClick={() => setValues({})}
            className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-6 py-3 text-[15px] font-medium text-[var(--fg)] transition-colors hover:border-[var(--fg)] max-sm:w-full"
          >
            Clear form
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full border border-[var(--fg)] bg-[var(--fg)] px-7 py-3 text-[15px] font-medium text-[var(--bg)] transition-opacity hover:opacity-80 disabled:opacity-50 max-sm:w-full"
          >
            {submitting ? 'Submitting…' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  )
}
