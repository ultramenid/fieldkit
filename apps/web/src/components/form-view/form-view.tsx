'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { BuilderField } from '@/lib/builder-types'
import { sanitizeRichTextHtml, normalizePlainDescriptionToHtml } from '@/lib/sanitize-rich-text'

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

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024
const DEFAULT_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const DEFAULT_ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const DEFAULT_HINT_TYPES = 'JPG, PNG, WebP, GIF'

function typesToExtensions(types: string[]): string[] {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg,.jpeg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'application/pdf': '.pdf',
  }
  return types.flatMap((t) => {
    const ext = map[t]
    return ext ? ext.split(',') : []
  })
}

function typesToLabel(types: string[]): string {
  const map: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'application/pdf': 'PDF',
  }
  return types.map((t) => map[t] ?? t).join(', ')
}

function FileUpload({ field, value, onChange }: {
  field: BuilderField
  value: string | null
  onChange: (val: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Read field settings or use defaults
  const maxSize = field.validation?.maxFileSize ?? DEFAULT_MAX_SIZE
  const acceptedTypes = field.validation?.acceptedTypes?.length
    ? field.validation.acceptedTypes
    : DEFAULT_ACCEPTED_TYPES
  const acceptAttr = typesToExtensions(acceptedTypes).join(',')
  const hintText = typesToLabel(acceptedTypes)
  const maxSizeMB = Math.round((maxSize / (1024 * 1024)) * 10) / 10

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  useEffect(() => {
    if (!value && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setFileName(null)
    }
  }, [value, previewUrl])

  async function handleFile(file: File) {
    setError(null)

    // Client-side size check from field settings
    if (file.size > maxSize) {
      setError(`File too large (max ${maxSizeMB}MB)`)
      return
    }

    // Client-side type check from field settings
    if (!acceptedTypes.includes(file.type)) {
      setError(`File type not allowed (${hintText})`)
      return
    }

    setUploading(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          maxSize,
          allowedTypes: acceptedTypes,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Upload failed'); setUploading(false); return }

      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!uploadRes.ok) { setError('Upload failed'); setUploading(false); return }

      setFileName(file.name)
      onChange(data.fileUrl)

      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file))
      } else {
        setPreviewUrl(null)
      }
    } catch {
      setError('Upload failed')
    }
    setUploading(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation()
    onChange(null)
    setFileName(null)
    if (previewUrl) { URL.revokeObjectURL(previewUrl); setPreviewUrl(null) }
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="mt-1 cursor-pointer rounded-[12px] border-2 border-dashed border-[var(--border)] p-8 text-center transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface)]"
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.currentTarget.value = '' }}
      />
      {uploading ? (
        <p className="text-[14px] text-[var(--muted)]">Uploading…</p>
      ) : value && fileName ? (
        <div className="flex flex-col items-center gap-2">
          {previewUrl && (
            <img src={previewUrl} alt={fileName} className="max-h-[160px] max-w-full rounded-[8px] object-contain" />
          )}
          {!previewUrl && (
            <svg className="h-10 w-10 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
          <p className="text-[14px] text-[var(--fg)]">{fileName}</p>
          <button
            type="button"
            onClick={handleRemove}
            className="text-[12px] text-[var(--muted)] underline hover:text-[var(--fg)]"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <svg className="mx-auto mb-2 h-8 w-8 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p className="text-[14px] text-[var(--muted)]">Drop file here or click to upload</p>
          <span className="text-[12px] text-[var(--border)]">{hintText} up to {maxSizeMB}MB</span>
        </>
      )}
      {error && <p className="mt-2 text-[13px] text-[#dc2626]">{error}</p>}
    </div>
  )
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
    case 'date':
      return (
        <input
          type="date"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          className="w-full appearance-none rounded-[12px] border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[15px] text-[var(--fg)] transition-colors focus:border-[var(--fg)] focus:outline-none"
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
      return <FileUpload field={field} value={value as string | null} onChange={onChange} />
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
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submissionStateReady, setSubmissionStateReady] = useState(isPreview || allowMultipleSubmissions)

  useEffect(() => {
    if (!isPreview && !allowMultipleSubmissions && localStorage.getItem(storageKey)) {
      setSubmitted(true)
    }
    setSubmissionStateReady(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filledCount = fields.filter((f) => {
    const v = values[f.id]
    if (Array.isArray(v)) return v.length > 0
    return v !== null && v !== undefined && v !== ''
  }).length

  const progress = fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0

  const descriptionHtml = useMemo(() => {
    const raw = (description ?? '').trim()
    if (!raw) return ''
    const hasHtmlElements = /<\s*\/?[a-z][^>]*>/i.test(raw)
    const source = hasHtmlElements ? raw : normalizePlainDescriptionToHtml(raw)
    return sanitizeRichTextHtml(source)
  }, [description])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isPreview) { setSubmitted(true); return }
    setSubmitError(null)
    setSubmitting(true)
    try {
      const answers = fields.map((f) => ({ fieldId: f.id, value: values[f.id] ?? null }))
      const res = await fetch(`/api/f/${formId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })
      if (!res.ok) throw new Error('Submit failed. Please try again.')

      if (!allowMultipleSubmissions) {
        localStorage.setItem(storageKey, '1')
      }
      setSubmitted(true)
    } catch (err) {
      setSubmitError('Submit failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!submissionStateReady) {
    return null
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
          {descriptionHtml && (
            <div className="mb-3 text-[15px] leading-relaxed text-[var(--muted)] [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-[var(--surface)] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_code]:rounded-[4px] [&_code]:bg-[var(--surface)] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_mark]:bg-[color:rgba(139,69,19,0.18)] [&_sup]:align-super [&_sup]:text-[11px] [&_sub]:align-sub [&_sub]:text-[11px] [&_a]:underline [&_a]:underline-offset-2 [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[10px]">
              {mounted ? (
                <span dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
              ) : (
                <span>{descriptionHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}</span>
              )}
            </div>
          )}
          <div className="mb-1.5 flex items-center justify-end">
            <span className="whitespace-nowrap font-mono text-[12px] text-[var(--muted)]">{progress}%</span>
          </div>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div className="h-full rounded-full bg-[var(--fg)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {!fields.length && descriptionHtml && (
        <div className="mb-9 text-[15px] leading-relaxed text-[var(--muted)] [&_p]:my-2 [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-[var(--surface)] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_code]:rounded-[4px] [&_code]:bg-[var(--surface)] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_mark]:bg-[color:rgba(139,69,19,0.18)] [&_sup]:align-super [&_sup]:text-[11px] [&_sub]:align-sub [&_sub]:text-[11px] [&_a]:underline [&_a]:underline-offset-2 [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[10px]">
          {mounted ? (
            <span dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          ) : (
            <span>{descriptionHtml.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}</span>
          )}
        </div>
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

        {submitError && <p className="text-[13px] text-[#dc2626]">{submitError}</p>}

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
