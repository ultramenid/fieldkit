'use client'

import { useBuilder } from '@/lib/builder-context'
import { Toggle } from './toggle'
import type { BuilderField } from '@/lib/builder-types'

const inputClass =
  'w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[13px] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none'

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--muted)]">{label}</label>
      {children}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 mt-5 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)] first:mt-0">
      {children}
    </h3>
  )
}

export function SettingsPanel() {
  const { state, dispatch } = useBuilder()
  const field = state.fields.find((f) => f.id === state.selectedId)

  if (!field) {
    return (
      <aside className="overflow-y-auto border-l border-[var(--border)] p-5">
        <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
          Form settings
        </h3>
        <div className="rounded-[12px] border border-[var(--border)] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[13px] font-medium text-[var(--foreground)]">Multiple submissions</p>
              <p className="mt-1 text-[12px] leading-relaxed text-[var(--muted)]">
                Allow respondents to submit more than once. When disabled, each device can only submit once.
              </p>
            </div>
            <div className="flex-shrink-0 pt-0.5">
              <Toggle
                checked={state.allowMultipleSubmissions}
                onChange={(val) => dispatch({ type: 'SET_ALLOW_MULTIPLE', allowMultipleSubmissions: val })}
              />
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-[var(--border)] pt-4 text-center text-[13px] text-[var(--muted)]">
          Select a field to edit its settings
        </div>
      </aside>
    )
  }

  function update(patch: Partial<BuilderField>) {
    dispatch({ type: 'UPDATE_FIELD', id: field!.id, patch })
  }

  const hasPlaceholder = ['text', 'email', 'number', 'textarea'].includes(field.type)
  const hasValidation = ['text', 'email', 'number', 'textarea'].includes(field.type)
  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type)
  const options = field.options ?? []

  return (
    <aside className="overflow-y-auto border-l border-[var(--border)] p-5">
      {/* Form settings — always at top */}
      <div className="mb-5 rounded-[12px] border border-[var(--border)] p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-[13px] font-medium text-[var(--foreground)]">Multiple submissions</p>
            <p className="mt-0.5 text-[11px] text-[var(--muted)]">Allow more than one response per device</p>
          </div>
          <Toggle
            checked={state.allowMultipleSubmissions}
            onChange={(val) => dispatch({ type: 'SET_ALLOW_MULTIPLE', allowMultipleSubmissions: val })}
          />
        </div>
      </div>

      <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.06em] text-[var(--muted)]">
        Field settings
      </h3>

      {/* Basic */}
      <SectionLabel>Basic</SectionLabel>
      <SettingRow label="Label">
        <input
          type="text"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
          className={inputClass}
        />
      </SettingRow>
      {hasPlaceholder && (
        <SettingRow label="Placeholder">
          <input
            type="text"
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value })}
            className={inputClass}
          />
        </SettingRow>
      )}
      <SettingRow label="Help text">
        <input
          type="text"
          value={field.helpText ?? ''}
          placeholder="Optional helper text"
          onChange={(e) => update({ helpText: e.target.value })}
          className={inputClass}
        />
      </SettingRow>

      {/* Behavior */}
      <SectionLabel>Behavior</SectionLabel>
      <div className="mb-4 flex items-center justify-between py-2">
        <span className="text-[13px] text-[var(--foreground)]">Required</span>
        <Toggle
          checked={field.required}
          onChange={(val) => update({ required: val })}
        />
      </div>

      {/* Validation */}
      {hasValidation && (
        <>
          <SectionLabel>Validation</SectionLabel>
          <SettingRow label="Min length">
            <input
              type="number"
              value={field.validation?.minLength ?? ''}
              placeholder="0"
              onChange={(e) =>
                update({
                  validation: {
                    ...field.validation,
                    minLength: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Max length">
            <input
              type="number"
              value={field.validation?.maxLength ?? ''}
              placeholder="No limit"
              onChange={(e) =>
                update({
                  validation: {
                    ...field.validation,
                    maxLength: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Pattern (regex)">
            <input
              type="text"
              value={field.validation?.pattern ?? ''}
              placeholder="e.g. ^[A-Za-z ]+$"
              onChange={(e) =>
                update({
                  validation: {
                    ...field.validation,
                    pattern: e.target.value || undefined,
                  },
                })
              }
              className={inputClass}
            />
          </SettingRow>
        </>
      )}

      {/* File upload settings */}
      {field.type === 'file' && (
        <>
          <SectionLabel>File settings</SectionLabel>
          <SettingRow label="Max file size (MB)">
            <input
              type="number"
              value={field.validation?.maxFileSize ? field.validation.maxFileSize / (1024 * 1024) : ''}
              placeholder="10"
              min="1"
              max="100"
              onChange={(e) =>
                update({
                  validation: {
                    ...field.validation,
                    maxFileSize: e.target.value ? Number(e.target.value) * 1024 * 1024 : undefined,
                  },
                })
              }
              className={inputClass}
            />
          </SettingRow>
          <SettingRow label="Accepted types">
            <select
              value={field.validation?.acceptedTypes?.join(',') ?? ''}
              onChange={(e) =>
                update({
                  validation: {
                    ...field.validation,
                    acceptedTypes: e.target.value ? e.target.value.split(',') : undefined,
                  },
                })
              }
              className={inputClass}
            >
              <option value="">Any file type</option>
              <option value="image/jpeg,image/png,image/webp">Images only (JPG, PNG, WebP)</option>
              <option value="application/pdf">PDF only</option>
              <option value="image/jpeg,image/png,image/webp,application/pdf">Images + PDF</option>
            </select>
          </SettingRow>
        </>
      )}

      {/* Options */}
      {hasOptions && (
        <>
          <SectionLabel>Options</SectionLabel>
          <div className="mb-3 flex flex-col gap-1.5">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...options]
                    next[i] = e.target.value
                    update({ options: next })
                  }}
                  className={`${inputClass} flex-1`}
                />
                <button
                  onClick={() => update({ options: options.filter((_, j) => j !== i) })}
                  className="flex-shrink-0 rounded-full px-2 py-1 text-[12px] text-[#dc2626] transition-colors hover:bg-[color-mix(in_oklch,#dc2626_10%,transparent)]"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => update({ options: [...options, 'New option'] })}
            className="rounded-full border border-[var(--border)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
          >
            + Add option
          </button>
        </>
      )}

      {/* Delete */}
      <button
        onClick={() => dispatch({ type: 'DELETE_FIELD', id: field.id })}
        className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-full border border-[color-mix(in_oklch,#dc2626_30%,transparent)] px-4 py-2.5 text-[13px] text-[#dc2626] transition-colors hover:bg-[color-mix(in_oklch,#dc2626_10%,transparent)]"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
        </svg>
        Delete field
      </button>
    </aside>
  )
}
