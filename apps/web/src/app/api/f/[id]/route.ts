import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { badRequest, notFound, withApiErrorHandling } from '@/lib/api-errors'

const submittedAnswerSchema = z.object({
  fieldId: z.string().optional(),
  value: z.unknown().optional(),
}).passthrough()

const submitPayloadSchema = z.object({
  answers: z.array(submittedAnswerSchema).max(200),
})

export const POST = withApiErrorHandling('published-form:submit', async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id || id.length > 128) {
    throw badRequest('Invalid form ID')
  }

  const form = await db.form.findFirst({
    where: { id, published: true, closed: false },
  })
  if (!form) throw notFound('Form not available')

  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw badRequest('Invalid JSON')
  }

  const parsedBody = submitPayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    throw badRequest('Invalid payload')
  }

  const sanitizedAnswers = parsedBody.data.answers.map(({ fieldId, value }) => {
    let sanitizedValue = value ?? null
    if (typeof sanitizedValue === 'string' && sanitizedValue.length > 65536) {
      sanitizedValue = sanitizedValue.slice(0, 65536)
    }
    if (Array.isArray(sanitizedValue)) {
      sanitizedValue = sanitizedValue.slice(0, 200).map(v =>
        typeof v === 'string' ? v.slice(0, 1024) : v
      )
    }
    return {
      fieldId: typeof fieldId === 'string' ? fieldId.slice(0, 128) : '',
      value: sanitizedValue,
    }
  })

  await db.response.create({
    data: {
      formId: id,
      submissionId: randomUUID(),
      source: 'online',
      data: { answers: sanitizedAnswers },
      submittedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
})
