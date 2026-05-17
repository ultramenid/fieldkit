'use client'

import Link from 'next/link'
import { useBuilder } from '@/lib/builder-context'

export function BuilderNav() {
  const { state, dispatch } = useBuilder()

  function handlePublish() {
    dispatch({ type: 'SET_PUBLISHED', isPublished: true })
  }

  return (
    <header className="flex flex-shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)] px-6 py-[14px]">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/"
          className="flex-shrink-0 font-sans text-[22px] font-medium text-[var(--foreground)] no-underline"
        >
          FieldKit
        </Link>
        <span className="flex-shrink-0 text-[18px] text-[var(--border)]">/</span>
        <input
          type="text"
          value={state.title}
          onChange={(e) => dispatch({ type: 'SET_TITLE', title: e.target.value })}
          className="min-w-0 max-w-[280px] flex-1 rounded-full border border-transparent bg-transparent px-3 py-1.5 font-sans text-[15px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--border)] hover:bg-[var(--surface)] focus:border-[var(--border)] focus:bg-[var(--surface)] focus:outline-none"
        />
      </div>
      <div className="flex flex-shrink-0 items-center gap-2.5">
        {state.isSaving && (
          <span className="text-[12px] text-[var(--muted)]">Saving…</span>
        )}
        <Link
          href={`/forms/${state.formId}/preview`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border-none bg-transparent px-2.5 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Preview
        </Link>
        <button className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]">
          Save draft
        </button>
        <button
          onClick={handlePublish}
          className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors ${
            state.isPublished
              ? 'border-[#16a34a] bg-[#16a34a] text-white'
              : 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] hover:opacity-80'
          }`}
        >
          {state.isPublished ? 'Published ✓' : 'Publish'}
        </button>
      </div>
    </header>
  )
}
