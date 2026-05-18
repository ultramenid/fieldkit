'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShareModal } from './share-modal'
import { DeletePrompt } from './delete-prompt'

interface FormData {
  id: string
  title: string
  description: string
  published: boolean
  closed: boolean
  createdAt: string
  responseCount: number
}

function FormCard({ form }: { form: FormData }) {
  const [showShare, setShowShare] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/forms/${form.id}`, { method: 'DELETE' })
    setDeleting(false)
    setShowDelete(false)
    router.refresh()
  }

  function exportConfig() {
    fetch(`/api/forms/${form.id}`)
      .then((r) => r.json())
      .then((data) => {
        const config = {
          formId: data.id,
          title: data.title,
          description: data.description,
          version: data.version ?? 1,
          exportedAt: new Date().toISOString(),
          ...(data.schema ?? {}),
        }
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${data.title.toLowerCase().replace(/\s+/g, '-')}-config.json`
        a.click()
        URL.revokeObjectURL(url)
      })
  }

  const date = new Date(form.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <>
      <div
        onClick={() => router.push(`/forms/${form.id}/responses`)}
        className="flex cursor-pointer flex-col gap-4 rounded-[12px] border border-[var(--border)] p-6 transition-colors hover:border-[var(--foreground)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="m-0 min-w-0 flex-1 truncate text-[16px] font-medium text-[var(--foreground)]">{form.title}</h3>
          <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-[10px] py-[3px] font-mono text-[12px] ${
            !form.published
              ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
              : form.closed
              ? 'border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]'
              : 'border-[color-mix(in_oklch,#16a34a_30%,transparent)] bg-[color-mix(in_oklch,#22c55e_10%,transparent)] text-[#16a34a]'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              !form.published ? 'bg-[var(--muted)]' : form.closed ? 'bg-[var(--muted)]' : 'bg-[#22c55e]'
            }`} />
            {!form.published ? 'Draft' : form.closed ? 'Closed' : 'Live'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[13px] text-[var(--muted)]">
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
            {form.responseCount} responses
          </span>
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {date}
          </span>
        </div>
        <div
          className="mt-auto flex gap-2 border-t border-[var(--border)] pt-3"
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/forms/${form.id}`}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--foreground)] no-underline transition-colors hover:border-[var(--foreground)]"
            onClick={(e) => e.stopPropagation()}
          >
            Edit
          </Link>
          <Link
            href={`/forms/${form.id}/responses`}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--foreground)] no-underline transition-colors hover:border-[var(--foreground)]"
            onClick={(e) => e.stopPropagation()}
          >
            Responses
          </Link>
          {form.published && !form.closed && (
            <button
              onClick={() => setShowShare(true)}
              className="rounded-full border border-[var(--border)] px-3 py-1.5 text-[12px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
            >
              Share
            </button>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true) }}
            disabled={deleting}
            className="ml-auto rounded-full border-none bg-transparent px-2.5 py-1.5 text-[12px] text-[var(--muted)] transition-colors hover:text-[#dc2626] disabled:opacity-40"
          >
            Delete
          </button>
        </div>
      </div>
      {showShare && (
        <ShareModal
          formId={form.id}
          formTitle={form.title}
          onClose={() => setShowShare(false)}
        />
      )}
      {showDelete && (
        <DeletePrompt
          formTitle={form.title}
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </>
  )
}

export function FormsGrid({ forms }: { forms: FormData[] }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'live' | 'closed' >('all')
  const router = useRouter()

  const filtered = forms.filter((f) => {
    if (!f.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filter === 'live') return f.published && !f.closed
    if (filter === 'closed') return f.published && f.closed
    return true
  })

  const filterBtn = (label: string, value: typeof filter) => (
    <button
      onClick={() => setFilter(value)}
      className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
        filter === value
          ? 'bg-[var(--foreground)] text-[var(--background)]'
          : 'border border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]'
      }`}
    >
      {label}
    </button>
  )

  return (
    <>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 pt-10">
        <h1 className="m-0 font-sans text-[28px] font-medium text-[var(--foreground)]">Your Forms</h1>
        <div className="flex items-center gap-3">
          <input
            type="search"
            placeholder="Search forms…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[220px] rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-[9px] text-[14px] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none max-sm:w-full"
          />
          <button
            onClick={() => router.push('/forms/new')}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-4 py-2 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 5v14M5 12h14" />
            </svg>
            New form
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 pb-6">
        {filterBtn('All', 'all')}
        {filterBtn('Live', 'live')}
        {filterBtn('Closed', 'closed')}
      </div>

      {/* Forms grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 pb-12 max-sm:grid-cols-1">
          {filtered.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="py-20 text-center">
          <h3 className="mb-2 font-sans text-[20px] font-medium text-[var(--foreground)]">No forms yet</h3>
          <p className="mb-6 text-[15px] text-[var(--muted)]">Create your first form to get started.</p>
          <button
            onClick={() => router.push('/forms/new')}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-5 py-2.5 text-[14px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
          >
            Create a form
          </button>
        </div>
      ) : (
        <div className="py-20 text-center text-[15px] text-[var(--muted)]">
          {search ? <>No forms match &ldquo;{search}&rdquo;</> : `No ${filter} forms`}
        </div>
      )}
    </>
  )
}
