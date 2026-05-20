'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Field {
  id: string
  label: string
  type: string
}

interface Response {
  id: string
  submissionId: string | null
  source: string
  submittedAt: string
  data: Record<string, unknown>
}

interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface ResponsesTableProps {
  formId: string
  formTitle: string
  fields: Field[]
  initialResponses: Response[]
  initialPagination: Pagination
  published: boolean
  closed: boolean
  version: number
}

export function ResponsesTable({
  formId,
  formTitle,
  fields,
  initialResponses,
  initialPagination,
  published,
  closed: initialClosed,
  version: initialVersion,
}: ResponsesTableProps) {
  const [responses, setResponses] = useState(initialResponses)
  const [search, setSearch] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | 'online' | 'local'>('all')
  const [closed, setClosed] = useState(initialClosed)
  const [version, setVersion] = useState(initialVersion)
  const [importBanner, setImportBanner] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null)
  const [page, setPage] = useState(initialPagination.page)
  const [pageSize, setPageSize] = useState(initialPagination.pageSize)
  const [total, setTotal] = useState(initialPagination.total)
  const [totalPages, setTotalPages] = useState(initialPagination.totalPages)
  const pageRef = useRef(page)
  const pageSizeRef = useRef(pageSize)
  const refreshRequestIdRef = useRef(0)
  const router = useRouter()

  useEffect(() => {
    pageRef.current = page
  }, [page])

  useEffect(() => {
    pageSizeRef.current = pageSize
  }, [pageSize])

  const refresh = useCallback(async (nextPage: number, nextPageSize: number) => {
    const requestId = refreshRequestIdRef.current + 1
    refreshRequestIdRef.current = requestId

    const params = new URLSearchParams({
      page: String(nextPage),
      pageSize: String(nextPageSize),
    })
    const res = await fetch(`/api/forms/${formId}/responses?${params.toString()}`)
    if (!res.ok || requestId !== refreshRequestIdRef.current) return
    const data = await res.json()
    if (requestId !== refreshRequestIdRef.current) return
    setResponses(data.responses)
    setPage(data.pagination.page)
    setPageSize(data.pagination.pageSize)
    setTotal(data.pagination.total)
    setTotalPages(data.pagination.totalPages)
  }, [formId])

  // SSE for real-time updates
  useEffect(() => {
    if (closed) return
    const es = new EventSource(`/api/forms/${formId}/stream`)

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      const msg = JSON.parse(e.data)
      if (msg.type === 'update') {
        void refresh(pageRef.current, pageSizeRef.current)
      }
    }

    es.onerror = () => {
      setConnected(false)
    }

    return () => {
      es.close()
      setConnected(false)
    }
  }, [formId, closed, refresh])

  async function toggleClosed() {
    const prevClosed = closed
    const next = !closed
    setClosed(next)
    const res = await fetch(`/api/forms/${formId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ closed: next, version }),
    })
    if (!res.ok) {
      setClosed(prevClosed)
      return
    }
    const data = await res.json() as { version?: number }
    if (typeof data.version === 'number') setVersion(data.version)
    router.refresh()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const json = JSON.parse(text)
    const responses = Array.isArray(json) ? json : json.responses ?? []
    const files = !Array.isArray(json) && json && typeof json === 'object' && json.files && typeof json.files === 'object'
      ? json.files
      : undefined
    const res = await fetch(`/api/forms/${formId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ responses, files }),
    })
    const data = await res.json()
    setImportBanner(`${data.imported} new responses imported from local server`)
    await refresh(page, pageSize)
    e.target.value = ''
  }

  function exportCSV() {
    const headers = ['#', ...fields.map((f) => f.label), 'Source', 'Submitted']
    const rows = filtered.map((r, i) => [
      String(filtered.length - i),
      ...fields.map((f) => {
        const answers = (r.data as { answers?: { fieldId: string; value: unknown }[] })?.answers ?? []
        const answer = answers.find((a) => a.fieldId === f.id)
        return String(answer?.value ?? '')
      }),
      r.source,
      new Date(r.submittedAt).toLocaleString(),
    ])
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, '-')}-responses.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = responses.filter((r) => {
    const matchesSource =
      sourceFilter === 'all' ||
      (sourceFilter === 'online' && r.source === 'online') ||
      (sourceFilter === 'local' && r.source !== 'online')
    if (!matchesSource) return false
    if (!search) return true
    const answers = (r.data as { answers?: { value: unknown }[] })?.answers ?? []
    const text = answers.map((a) => String(a.value ?? '')).join(' ').toLowerCase()
    return text.includes(search.toLowerCase())
  })

  const onlineCount = responses.filter((r) => r.source === 'online').length
  const localCount = responses.filter((r) => r.source !== 'online').length
  const isLocalFilterActive = search.trim().length > 0 || sourceFilter !== 'all'
  const displayTotal = isLocalFilterActive ? filtered.length : total
  const displayPage = isLocalFilterActive ? 1 : page
  const displayPageSize = isLocalFilterActive ? Math.max(filtered.length, 1) : pageSize
  const displayTotalPages = isLocalFilterActive ? 1 : totalPages
  const displayStart = displayTotal === 0 ? 0 : (displayPage - 1) * displayPageSize + 1
  const displayEnd = displayTotal === 0 ? 0 : Math.min(displayPage * displayPageSize, displayTotal)
  const displayPageItems = (() => {
    if (displayTotalPages <= 9) {
      return Array.from({ length: displayTotalPages }, (_, i) => i + 1)
    }

    const pageSet = new Set<number>([
      1,
      2,
      displayPage - 1,
      displayPage,
      displayPage + 1,
      displayTotalPages - 1,
      displayTotalPages,
    ])

    const pages = Array.from(pageSet)
      .filter((n) => n >= 1 && n <= displayTotalPages)
      .sort((a, b) => a - b)

    const items: Array<number | 'ellipsis'> = []
    for (let i = 0; i < pages.length; i += 1) {
      const current = pages[i]
      const prev = pages[i - 1]

      if (prev && current - prev > 1) {
        items.push('ellipsis')
      }

      items.push(current)
    }

    return items
  })()

  function goToPage(nextPage: number) {
    if (nextPage < 1 || nextPage > displayTotalPages || nextPage === displayPage) return
    void refresh(nextPage, pageSize)
  }

  function handlePageSizeChange(nextSize: number) {
    if (![10, 25, 50].includes(nextSize)) return
    void refresh(1, nextSize)
  }

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-6 pt-8">
        <div>
          <h1 className="m-0 font-sans text-[24px] font-medium text-[var(--foreground)]">{formTitle}</h1>
          <p className="mt-1 text-[14px] text-[var(--muted)]">
            {displayTotal} responses
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {published && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              closed
                ? 'bg-[color-mix(in_oklch,#737373_12%,transparent)] text-[var(--muted)]'
                : 'bg-[color-mix(in_oklch,#22c55e_12%,transparent)] text-[#16a34a]'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${closed ? 'bg-[var(--muted)]' : 'bg-[#22c55e] animate-pulse'}`} />
              {closed ? 'Closed' : 'Live'}
            </span>
          )}
          {published && (
            <button
              onClick={toggleClosed}
              className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]"
            >
              {closed ? 'Reopen form' : 'Close form'}
            </button>
          )}
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import local data
            <input type="file" accept=".json" className="hidden" onChange={handleImport} />
          </label>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--background)] transition-opacity hover:opacity-80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Import banner */}
      {importBanner && (
        <div className="mb-4 flex items-center justify-between rounded-[12px] border border-[color-mix(in_oklch,#f59e0b_25%,transparent)] bg-[color-mix(in_oklch,#f59e0b_8%,transparent)] px-4 py-3 text-[13px]">
          <span className="text-[var(--foreground)]">{importBanner}</span>
          <button onClick={() => setImportBanner(null)} className="text-[var(--muted)] hover:text-[var(--foreground)]">Dismiss</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search responses…"
            value={search}
            onChange={(e) => {
              const nextSearch = e.target.value
              const nextFilterActive = nextSearch.trim().length > 0 || sourceFilter !== 'all'
              setSearch(nextSearch)
              setPage(1)
              if (!nextFilterActive) {
                void refresh(1, pageSize)
              }
            }}
            className="w-[200px] rounded-full border border-[var(--border)] bg-[var(--background)] px-[14px] py-[7px] text-[13px] text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          />
          {(['all', 'online', 'local'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                const nextFilterActive = search.trim().length > 0 || f !== 'all'
                setSourceFilter(f)
                setPage(1)
                if (!nextFilterActive) {
                  void refresh(1, pageSize)
                }
              }}
              className={`rounded-full border px-3 py-[6px] font-mono text-[12px] transition-colors ${
                sourceFilter === f
                  ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {f === 'all' ? `All (${responses.length})` : f === 'online' ? `Online (${onlineCount})` : `Local (${localCount})`}
            </button>
          ))}
        </div>
        {!closed && (
          <span className={`flex items-center gap-1.5 font-mono text-[12px] ${connected ? 'text-[#16a34a]' : 'text-[var(--muted)]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-[#22c55e] animate-pulse' : 'bg-[var(--muted)]'}`} />
            {connected ? 'Live' : 'Connecting…'}
          </span>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[15px] text-[var(--muted)]">
            {responses.length === 0 ? 'No responses yet.' : 'No responses match your filter.'}
          </div>
        ) : (
          <table className="w-full border-collapse text-[13px]" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th className="w-[4%] border-b border-[var(--border)] bg-[var(--surface)] px-[14px] py-[10px] text-left font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]">#</th>
                {fields.map((f) => (
                  <th key={f.id} className="border-b border-[var(--border)] bg-[var(--surface)] px-[14px] py-[10px] text-left font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--muted)] overflow-hidden text-ellipsis whitespace-nowrap">
                    {f.label}
                  </th>
                ))}
                <th className="w-[8%] border-b border-[var(--border)] bg-[var(--surface)] px-[14px] py-[10px] text-left font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]">Source</th>
                <th className="w-[10%] border-b border-[var(--border)] bg-[var(--surface)] px-[14px] py-[10px] text-left font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--muted)]">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => {
                const answers = (r.data as { answers?: { fieldId: string; value: unknown }[] })?.answers ?? []
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedResponse(r)}
                    className="hover:bg-[var(--surface)] cursor-pointer"
                  >
                    <td className="border-b border-[var(--border)] px-[14px] py-[12px] font-mono text-[12px] tabular-nums text-[var(--muted)]">
                      {displayTotal - ((displayPage - 1) * displayPageSize + i)}
                    </td>
                    {fields.map((f) => {
                      const answer = answers.find((a) => a.fieldId === f.id)
                      const val = answer?.value
                      return (
                        <td key={f.id} className="overflow-hidden text-ellipsis whitespace-nowrap border-b border-[var(--border)] px-[14px] py-[12px] text-[var(--foreground)]">
                          {Array.isArray(val) ? val.join(', ') : String(val ?? '—')}
                        </td>
                      )
                    })}
                    <td className="border-b border-[var(--border)] px-[14px] py-[12px]">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                        r.source === 'online'
                          ? 'border-[color-mix(in_oklch,#16a34a_30%,transparent)] text-[#16a34a]'
                          : 'border-[color-mix(in_oklch,#f59e0b_30%,transparent)] text-[#b45309]'
                      }`}>
                        {r.source === 'online' ? 'Online' : 'Local'}
                      </span>
                    </td>
                    <td className="border-b border-[var(--border)] px-[14px] py-[12px] font-mono text-[12px] tabular-nums text-[var(--muted)]">
                      {new Date(r.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Response detail modal */}
      {selectedResponse && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setSelectedResponse(null)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[85dvh] w-full max-w-[540px] overflow-y-auto rounded-t-[12px] border border-[var(--border)] bg-[var(--background)] p-6 md:inset-x-0 md:top-1/2 md:bottom-auto md:max-h-[80dvh] md:-translate-y-1/2 md:rounded-[12px]">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-sans text-[18px] font-medium text-[var(--foreground)]">
                  Response
                </h3>
                <p className="mt-1 text-[13px] text-[var(--muted)]">
                  {new Date(selectedResponse.submittedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedResponse(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] text-[var(--muted)] hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {((): JSX.Element[] => {
                const respAnswers = (selectedResponse.data as { answers?: { fieldId: string; value: unknown }[] })?.answers ?? []
                return fields.map((f) => {
                  const answer = respAnswers.find((a) => a.fieldId === f.id)
                  const val = answer?.value
                  return (
                    <div key={f.id} className="rounded-[12px] border border-[var(--border)] px-4 py-3">
                      <p className="mb-0.5 font-mono text-[11px] uppercase tracking-[0.04em] text-[var(--muted)] break-words">
                        {f.label}
                      </p>
                      <p className="text-[14px] text-[var(--foreground)] break-words whitespace-normal">
                        {val == null || val === '' ? '—' : Array.isArray(val) ? val.join(', ') : String(val)}
                      </p>
                    </div>
                  )
                })
              })()}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className={`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px] ${
                selectedResponse.source === 'online'
                  ? 'border-[color-mix(in_oklch,#16a34a_30%,transparent)] text-[#16a34a]'
                  : 'border-[color-mix(in_oklch,#f59e0b_30%,transparent)] text-[#b45309]'
              }`}>
                {selectedResponse.source === 'online' ? 'Online' : 'Local'}
              </span>
              <span className="font-mono text-[12px] tabular-nums text-[var(--muted)]">
                {new Date(selectedResponse.submittedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pb-8 pt-4">
        <span className="font-mono text-[12px] text-[var(--muted)]">
          {displayTotal === 0 ? '0 of 0 responses' : `${displayStart}–${displayEnd} of ${displayTotal} responses`}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-[6px] font-mono text-[12px]"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>

          <button onClick={() => goToPage(1)} disabled={displayPage === 1} className="rounded-full border border-[var(--border)] px-3 py-[6px] font-mono text-[12px] disabled:opacity-50">First</button>
          <button onClick={() => goToPage(displayPage - 1)} disabled={displayPage === 1} className="rounded-full border border-[var(--border)] px-3 py-[6px] font-mono text-[12px] disabled:opacity-50">Prev</button>

          {displayPageItems.map((n, index) => (
            n === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 font-mono text-[12px] text-[var(--muted)]">…</span>
            ) : (
              <button
                key={n}
                onClick={() => goToPage(n)}
                disabled={n === displayPage}
                className={`rounded-full border px-3 py-[6px] font-mono text-[12px] ${n === displayPage ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]' : 'border-[var(--border)]'}`}
              >
                {n}
              </button>
            )
          ))}

          <button onClick={() => goToPage(displayPage + 1)} disabled={displayPage === displayTotalPages} className="rounded-full border border-[var(--border)] px-3 py-[6px] font-mono text-[12px] disabled:opacity-50">Next</button>
          <button onClick={() => goToPage(displayTotalPages)} disabled={displayPage === displayTotalPages} className="rounded-full border border-[var(--border)] px-3 py-[6px] font-mono text-[12px] disabled:opacity-50">Last</button>
        </div>
      </div>
    </div>
  )
}
