import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'

const MAX_BATCH_SIZE = 500

interface MobileResponse {
  submissionId: string
  submittedAt: string
  source?: string
  answers: { fieldId: string; value: unknown }[]
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

  if (responses.length > MAX_BATCH_SIZE) {
    return NextResponse.json({ error: `Max ${MAX_BATCH_SIZE} responses per request` }, { status: 400 })
  }

  const form = await db.form.findFirst({ where: { id: formId } })
  if (!form || !form.mobileSecret || form.mobileSecret !== secret) {
    return NextResponse.json({ error: 'Invalid form or secret' }, { status: 401 })
  }

  const valid = responses.filter((r) => {
    if (!r.submissionId || !Array.isArray(r.answers)) return false
    if (r.submittedAt) {
      const d = new Date(r.submittedAt)
      if (isNaN(d.getTime())) return false
    }
    return true
  })

  if (valid.length === 0) {
    return NextResponse.json({ ok: true, imported: 0, duplicates: 0 })
  }

  const submissionIds = valid.map((r) => r.submissionId)

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.response.findMany({
      where: { submissionId: { in: submissionIds } },
      select: { submissionId: true },
    })

    const existingIds = new Set(existing.map((e) => e.submissionId))
    const newResponses = valid.filter((r) => !existingIds.has(r.submissionId))

    if (newResponses.length > 0) {
      await tx.response.createMany({
        data: newResponses.map((r) => ({
          formId,
          submissionId: r.submissionId,
          source: r.source ?? 'mobile',
          submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
          data: { answers: r.answers } as Prisma.InputJsonValue,
        })),
      })
    }

    return { imported: newResponses.length, duplicates: valid.length - newResponses.length }
  })

  console.log(`[mobile-sync] form=${formId} imported=${result.imported} duplicates=${result.duplicates}`)

  return NextResponse.json({ ok: true, imported: result.imported, duplicates: result.duplicates })
}
