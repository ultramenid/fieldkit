import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { badRequest, notFound, unauthorized, withApiErrorHandling } from '@/lib/api-errors'

const importedResponseSchema = z.object({
  submissionId: z.string().min(1),
  source: z.string().optional(),
  data: z.unknown().optional(),
  submittedAt: z.string().datetime().optional(),
}).passthrough()

const MAX_IMPORT_RESPONSES = 500

const importResponsesPayloadSchema = z.object({
  responses: z.array(importedResponseSchema).max(MAX_IMPORT_RESPONSES),
})

export const GET = withApiErrorHandling('responses:list', async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const form = await db.form.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!form) throw notFound()

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
})

export const POST = withApiErrorHandling('responses:import', async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const form = await db.form.findFirst({
    where: { id, userId: session.user.id },
  })
  if (!form) throw notFound()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw badRequest('Invalid JSON')
  }

  const parsedBody = importResponsesPayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    throw badRequest('Invalid payload')
  }

  const validResponses = parsedBody.data.responses.map((r) => ({
    submissionId: r.submissionId,
    source: r.source ?? 'local',
    data: r.data ?? r,
    submittedAt: r.submittedAt,
  }))

  const result = await db.response.createMany({
    data: validResponses.map((r) => ({
      formId: id,
      submissionId: r.submissionId,
      source: r.source,
      data: r.data,
      submittedAt: r.submittedAt ? new Date(r.submittedAt) : new Date(),
    })),
    skipDuplicates: true,
  })

  const duplicates = validResponses.length - result.count

  return NextResponse.json({ imported: result.count, duplicates })
})
