'use client'

import { useState } from 'react'

interface ShareModalProps {
  formId: string
  formTitle: string
  onClose: () => void
}

export function ShareModal({ formId, formTitle, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/f/${formId}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function exportConfig() {
    fetch(`/api/forms/${formId}`)
      .then((r) => r.json())
      .then((form) => {
        const config = {
          formId: form.id,
          title: form.title,
          description: form.description,
          version: form.version ?? 1,
          exportedAt: new Date().toISOString(),
          ...(form.schema ?? {}),
        }
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${form.title.toLowerCase().replace(/\s+/g, '-')}-config.json`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[440px] rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[20px] text-[var(--muted)] hover:text-[var(--foreground)]"
        >
          ×
        </button>
        <h3 className="mb-2 font-sans text-[20px] font-medium text-[var(--foreground)]">
          Share form
        </h3>
        <p className="mb-5 text-[14px] text-[var(--muted)]">
          Anyone with the link can submit responses.
        </p>
        <div className="flex gap-2">
          <input
            readOnly
            value={shareUrl}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[14px] text-[var(--foreground)]"
          />
          <button
            onClick={copyLink}
            className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-80 whitespace-nowrap"
          >
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
        <div className="mt-5 border-t border-[var(--border)] pt-5">
          <p className="mb-3 text-[13px] text-[var(--muted)]">Export for local server</p>
          <button
            onClick={exportConfig}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download config (.json)
          </button>
        </div>
      </div>
    </div>
  )
}
