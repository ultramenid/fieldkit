'use client'

import { useState, useEffect } from 'react'
import { FormsGrid } from './forms-grid'

interface FormData {
  id: string
  title: string
  description: string
  published: boolean
  closed: boolean
  createdAt: string
  responseCount: number
}

interface DashboardStatsProps {
  initialTotalForms: number
  initialTotalResponses: number
  initialPublishedCount: number
  initialForms: FormData[]
}

export function DashboardStats({
  initialTotalForms,
  initialTotalResponses,
  initialPublishedCount,
  initialForms,
}: DashboardStatsProps) {
  const [stats, setStats] = useState({
    totalForms: initialTotalForms,
    totalResponses: initialTotalResponses,
    publishedCount: initialPublishedCount,
  })
  const [forms, setForms] = useState(initialForms)

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/dashboard/stats')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalForms: data.totalForms,
          totalResponses: data.totalResponses,
          publishedCount: data.publishedCount,
        })
        // Update response counts on form cards
        if (data.formResponseCounts) {
          setForms((prev) =>
            prev.map((f) => ({
              ...f,
              responseCount: data.formResponseCounts[f.id] ?? f.responseCount,
            }))
          )
        }
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="mb-8 grid grid-cols-3 gap-4 pt-10 max-sm:grid-cols-1">
        <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
          <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
            {stats.totalForms}
          </div>
          <div className="mt-1 text-[13px] text-[var(--muted)]">Total forms</div>
        </div>
        <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
          <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
            {stats.totalResponses}
          </div>
          <div className="mt-1 text-[13px] text-[var(--muted)]">Total responses</div>
        </div>
        <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
          <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
            {stats.publishedCount}
          </div>
          <div className="mt-1 text-[13px] text-[var(--muted)]">Published forms</div>
        </div>
      </div>
      <FormsGrid forms={forms} />
    </>
  )
}
