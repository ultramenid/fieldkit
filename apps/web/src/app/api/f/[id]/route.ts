import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (!id || id.length > 128) {
    return NextResponse.json({ error: 'Invalid form ID' }, { status: 400 })
  }

  const form = await db.form.findFirst({
    where: { id, published: true, closed: false },
  })
  if (!form) return NextResponse.json({ error: 'Form not available' }, { status: 404 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { answers } = body as { answers?: unknown }
  if (!Array.isArray(answers)) {
    return NextResponse.json({ error: 'answers must be an array' }, { status: 400 })
  }

  if (answers.length > 200) {
    return NextResponse.json({ error: 'Too many answers' }, { status: 400 })
  }

  const sanitizedAnswers = answers.map((a: unknown) => {
    if (!a || typeof a !== 'object') return { fieldId: '', value: null }
    const { fieldId, value } = a as { fieldId?: unknown; value?: unknown }
    // Enforce max value size to prevent large payload storage
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
}
