import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Client } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!form) return new Response('Not found', { status: 404 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      async function fetchAndSend() {
        const responses = await db.response.findMany({
          where: { formId: params.id },
          orderBy: { submittedAt: 'desc' },
        })
        send({
          type: 'update',
          responses: responses.map((r) => ({
            id: r.id,
            submissionId: r.submissionId,
            source: r.source,
            submittedAt: r.submittedAt.toISOString(),
            data: r.data,
          })),
        })
      }

      // Send current responses immediately on connect
      await fetchAndSend()

      // Set up Postgres LISTEN — only queries when a new response is inserted
      const pgClient = new Client({ connectionString: process.env.DATABASE_URL })
      await pgClient.connect()
      await pgClient.query('LISTEN new_response')

      pgClient.on('notification', async (msg) => {
        try {
          const payload = JSON.parse(msg.payload ?? '{}')
          // Only push if notification is for this form
          if (payload.formId === params.id) {
            await fetchAndSend()
          }
        } catch {
          // ignore parse errors
        }
      })

      pgClient.on('error', () => {
        controller.close()
      })

      // Clean up when client disconnects
      req.signal.addEventListener('abort', async () => {
        await pgClient.end().catch(() => {})
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
