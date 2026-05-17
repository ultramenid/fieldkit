import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { Client } from 'pg'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Unauthorized', { status: 401 })

  const userId = session.user.id
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      async function fetchAndSend() {
        const forms = await db.form.findMany({
          where: { userId },
          include: { _count: { select: { responses: true } } },
        })
        const totalForms = forms.length
        const totalResponses = forms.reduce((sum, f) => sum + f._count.responses, 0)
        const publishedCount = forms.filter((f) => (f as { published?: boolean }).published).length
        const formResponseCounts: Record<string, number> = {}
        forms.forEach((f) => { formResponseCounts[f.id] = f._count.responses })
        send({ type: 'update', totalForms, totalResponses, publishedCount, formResponseCounts })
      }

      // Send current stats immediately on connect
      await fetchAndSend()

      // Listen for any new response inserts
      const pgClient = new Client({ connectionString: process.env.DATABASE_URL })
      await pgClient.connect()
      await pgClient.query('LISTEN new_response')

      pgClient.on('notification', async () => {
        try {
          await fetchAndSend()
        } catch {
          // ignore
        }
      })

      pgClient.on('error', () => controller.close())

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
