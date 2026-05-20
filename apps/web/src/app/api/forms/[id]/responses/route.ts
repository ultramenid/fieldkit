import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { searchParams } = new URL(_req.url)
  const parsedPage = Number(searchParams.get('page') ?? '1')
  const parsedPageSize = Number(searchParams.get('pageSize') ?? '25')

  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1
  const pageSize = [10, 25, 50].includes(parsedPageSize) ? parsedPageSize : 25

  const total = await db.response.count({
    where: { formId: id },
  })

  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
  const safePage = Math.min(page, totalPages)

  const responses = await db.response.findMany({
    where: { formId: id },
    orderBy: { submittedAt: 'desc' },
    skip: (safePage - 1) * pageSize,
    take: pageSize,
  })

  return NextResponse.json({
    responses,
    pagination: {
      page: safePage,
      pageSize,
      total,
      totalPages,
    },
  })
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { responses } = body

  if (!Array.isArray(responses)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Import with deduplication by submissionId
  const result = await db.$transaction(async (tx) => {
    const submissionIds = responses
      .filter((r: { submissionId?: string }) => r.submissionId)
      .map((r: { submissionId?: string }) => r.submissionId as string)

    const existing = await tx.response.findMany({
      where: { submissionId: { in: submissionIds } },
      select: { submissionId: true },
    })

    const existingIds = new Set(
      existing
        .filter((e): e is { submissionId: string } => e.submissionId !== null)
        .map((e) => e.submissionId)
    )

    const toCreate = responses.filter(
      (r: { submissionId?: string }) => !r.submissionId || !existingIds.has(r.submissionId)
    )

    if (toCreate.length > 0) {
      await tx.response.createMany({
        data: toCreate.map((r: { submissionId?: string; source?: string; data?: unknown; submittedAt?: string }) => ({
          formId: id,
          submissionId: r.submissionId ?? null,
          source: r.source ?? 'local',
          data: r.data ?? r,
          submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
        })),
      })
    }

    return { imported: toCreate.length }
  })

  return NextResponse.json({ imported: result.imported })
}
