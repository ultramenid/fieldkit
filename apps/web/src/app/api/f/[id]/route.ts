import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const form = await db.form.findFirst({
    where: { id: params.id, published: true, closed: false },
  })
  if (!form) return NextResponse.json({ error: 'Form not available' }, { status: 404 })

  const body = await req.json()
  const { answers } = body

  await db.response.create({
    data: {
      formId: params.id,
      submissionId: randomUUID(),
      source: 'online',
      data: { answers: answers ?? [] },
      submittedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true })
}
