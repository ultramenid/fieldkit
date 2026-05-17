import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
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

  let lastCount = await db.response.count({ where: { formId: params.id } })

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      // Send initial ping
      send({ type: 'connected' })

      const interval = setInterval(async () => {
        try {
          const count = await db.response.count({ where: { formId: params.id } })
          if (count !== lastCount) {
            lastCount = count
            const responses = await db.response.findMany({
              where: { formId: params.id },
              orderBy: { submittedAt: 'desc' },
            })
            const serialized = responses.map((r) => ({
              id: r.id,
              submissionId: r.submissionId,
              source: r.source,
              submittedAt: r.submittedAt.toISOString(),
              data: r.data,
            }))
            send({ type: 'update', responses: serialized })
          }
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 2000)

      // Clean up when client disconnects
      _req.signal.addEventListener('abort', () => {
        clearInterval(interval)
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
