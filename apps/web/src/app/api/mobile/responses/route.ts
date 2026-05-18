import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface MobileResponse {
  submissionId: string
  submittedAt: string
  source?: string
  answers: Record<string, unknown>[]
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { formId, secret, responses } = (body ?? {}) as {
    formId?: string
    secret?: string
    responses?: MobileResponse[]
  }

  if (!formId || !secret || !Array.isArray(responses) || responses.length === 0) {
    return NextResponse.json({ error: 'Missing formId, secret, or responses' }, { status: 400 })
  }

  const form = await db.form.findFirst({ where: { id: formId } })
  if (!form) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  if (!form.mobileSecret || form.mobileSecret !== secret) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  let imported = 0
  let duplicates = 0

  for (const r of responses) {
    if (!r.submissionId || !Array.isArray(r.answers)) continue

    const existing = await db.response.findFirst({
      where: { submissionId: r.submissionId },
    })
    if (existing) {
      duplicates++
      continue
    }

    await db.response.create({
      data: {
        formId,
        submissionId: r.submissionId,
        source: r.source ?? 'mobile',
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { answers: r.answers as any },
      },
    })
    imported++
  }

  return NextResponse.json({ ok: true, imported, duplicates })
}
