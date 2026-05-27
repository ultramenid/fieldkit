import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { db } from '@/lib/db'

import { badRequest, unauthorized, withApiErrorHandling } from '@/lib/api-errors'
const MAX_BATCH_SIZE = 500

const mobileResponseSchema = z.object({
  submissionId: z.string().min(1),
  submittedAt: z.string().datetime().optional(),
  source: z.string().optional(),
  answers: z.array(z.object({
    fieldId: z.string().min(1).max(128),
    value: z.unknown(),
  })).max(200),
})

const mobileResponsesPayloadSchema = z.object({
  formId: z.string().min(1),
  secret: z.string().min(1),
  responses: z.array(mobileResponseSchema).min(1).max(MAX_BATCH_SIZE),
})

export const POST = withApiErrorHandling('mobile-responses:import', async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw badRequest('Invalid JSON')
  }

  const parsedBody = mobileResponsesPayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    throw badRequest('Invalid payload')
  }

  const { formId, secret, responses } = parsedBody.data

  const form = await db.form.findFirst({ where: { id: formId } })
  if (!form || !form.mobileSecret || form.mobileSecret !== secret) {
    throw unauthorized('Invalid form or secret')
  }

  const result = await db.response.createMany({
    data: responses.map((r) => ({
      formId,
      submissionId: r.submissionId,
      source: r.source ?? 'mobile',
      submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
      data: { answers: r.answers } as Prisma.InputJsonValue,
    })),
    skipDuplicates: true,
  })

  const duplicates = responses.length - result.count

  console.log(`[mobile-sync] form=${formId} imported=${result.count} duplicates=${duplicates}`)

  return NextResponse.json({ ok: true, imported: result.count, duplicates })
})
