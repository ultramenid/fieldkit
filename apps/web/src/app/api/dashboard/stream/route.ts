import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Client } from 'pg'
import { handleApiError, unauthorized } from '@/lib/api-errors'
import { createSseStream } from '@/lib/sse-stream'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  let userId: string
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL })

  try {
    const session = await auth()
    if (!session?.user?.id) throw unauthorized()
    userId = session.user.id
    await pgClient.connect()
    await pgClient.query('LISTEN new_response')
    await pgClient.query('LISTEN form_change')
  } catch (error) {
    await pgClient.end().catch(() => {})
    return handleApiError(error, 'dashboard:stream')
  }
  const stream = createSseStream({
    pgClient,
    request: req,
    context: 'dashboard:stream',
    async fetchAndSend(send) {
      const forms = await db.form.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { _count: { select: { responses: true } } },
      })
      const totalForms = forms.length
      type FormWithCount = (typeof forms)[number]
      const totalResponses = forms.reduce((sum: number, f: FormWithCount) => sum + f._count.responses, 0)
      const publishedCount = forms.filter((f: FormWithCount) => f.published).length
      const formResponseCounts: Record<string, number> = {}
      forms.forEach((f: FormWithCount) => { formResponseCounts[f.id] = f._count.responses })
      const formsList = forms.map((f: FormWithCount) => ({
        id: f.id,
        title: f.title,
        description: f.description,
        published: f.published ?? false,
        closed: f.closed ?? false,
        createdAt: f.createdAt.toISOString(),
        responseCount: f._count.responses,
      }))
      send({ type: 'update', totalForms, totalResponses, publishedCount, formResponseCounts, forms: formsList })
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
