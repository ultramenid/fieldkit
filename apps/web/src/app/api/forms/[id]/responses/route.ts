import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const responses = await db.response.findMany({
    where: { formId: params.id },
    orderBy: { submittedAt: 'desc' },
  })

  return NextResponse.json(responses)
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { responses } = body

  if (!Array.isArray(responses)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Import with deduplication by submissionId
  let imported = 0
  for (const r of responses) {
    if (r.submissionId) {
      const existing = await db.response.findFirst({
        where: { formId: params.id, submissionId: r.submissionId },
      })
      if (existing) continue
    }
    await db.response.create({
      data: {
        formId: params.id,
        submissionId: r.submissionId ?? null,
        source: r.source ?? 'local',
        data: r.data ?? r,
        submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
      },
    })
    imported++
  }

  return NextResponse.json({ imported })
}
