import { Client, type Notification } from 'pg'

export function createSseStream(options: {
  pgClient: Client
  request: Request
  context: string
  fetchAndSend: (send: (data: unknown) => void) => Promise<void>
  shouldRefresh?: (channel: string, payload: Record<string, unknown>) => boolean
}): ReadableStream {
  const { pgClient, request, context, fetchAndSend, shouldRefresh } = options
  const encoder = new TextEncoder()
  let closed = false
  let cleanup: (() => void) | undefined
  let closeStream: (() => Promise<void>) | undefined

  return new ReadableStream({
    async start(controller) {
      let refreshing = false
      let needsRefresh = false

      closeStream = async () => {
        if (closed) return
        closed = true
        cleanup?.()
        await pgClient.end().catch(() => {})
        try {
          controller.close()
        } catch {
        }
      }

      function send(data: unknown) {
        if (closed) return
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
        } catch {
          void closeStream?.()
        }
      }

      async function refresh({ fatal = false } = {}) {
        if (closed) return
        if (refreshing) {
          needsRefresh = true
          return
        }
        refreshing = true
        try {
          do {
            needsRefresh = false
            await fetchAndSend(send)
          } while (needsRefresh && !closed)
        } catch (error) {
          if (fatal) throw error
          console.error(`[${context}] refresh failed:`, error)
        } finally {
          refreshing = false
        }
      }

      const onNotification = (msg: Notification) => {
        if (shouldRefresh) {
          let payload: Record<string, unknown>
          try {
            payload = JSON.parse(msg.payload ?? '{}')
          } catch {
            return
          }
          if (!shouldRefresh(msg.channel, payload)) return
        }
        void refresh()
      }
      const onError = () => {
        void closeStream?.()
      }
      const onAbort = () => {
        void closeStream?.()
      }

      cleanup = () => {
        pgClient.off('notification', onNotification)
        pgClient.off('error', onError)
        request.signal.removeEventListener('abort', onAbort)
      }

      pgClient.on('notification', onNotification)
      pgClient.on('error', onError)
      request.signal.addEventListener('abort', onAbort)

      if (request.signal.aborted) {
        await closeStream()
        return
      }

      try {
        await refresh({ fatal: true })
      } catch (error) {
        console.error(`[${context}] initial fetch failed:`, error)
        await closeStream()
      }
    },
    async cancel() {
      await closeStream?.()
    },
  })
}
