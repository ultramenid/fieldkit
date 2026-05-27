import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Client } from 'pg'
import { handleApiError, notFound, unauthorized } from '@/lib/api-errors'
import { createSseStream } from '@/lib/sse-stream'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let id: string
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    ;({ id } = await params)
    const session = await auth()
    if (!session?.user?.id) throw unauthorized()

    const form = await db.form.findFirst({
      where: { id: id, userId: session.user.id },
    })
    if (!form) throw notFound()

    await pgClient.connect()
    await pgClient.query('LISTEN new_response')
  } catch (error) {
    await pgClient.end().catch(() => {})
    return handleApiError(error, 'forms:responses-stream')
  }

  const stream = createSseStream({
    pgClient,
    request: req,
    context: 'forms:responses-stream',
    shouldRefresh: (_channel, payload) => payload.formId === id,
    async fetchAndSend(send) {
      const responses = await db.response.findMany({
        where: { formId: id },
        orderBy: { submittedAt: 'desc' },
      })
      send({
        type: 'update',
        responses: responses.map((r: (typeof responses)[number]) => ({
          id: r.id,
          submissionId: r.submissionId,
          source: r.source,
          submittedAt: r.submittedAt.toISOString(),
          data: r.data,
        })),
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
