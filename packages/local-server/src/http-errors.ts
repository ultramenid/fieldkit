import type { ErrorRequestHandler } from 'express'

export class HttpError extends Error {
  status: number
  expose: boolean

  constructor(status: number, message: string, expose = true) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.expose = expose
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message)
}

export function notFound(message = 'Not found'): HttpError {
  return new HttpError(404, message)
}

export const errorMiddleware: ErrorRequestHandler = (error, req, res, next) => {
  if (res.headersSent) {
    console.error(`[local-server] ${req.method} ${req.path}:`, error)
    next(error)
    return
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.expose ? error.message : 'Something went wrong' })
    return
  }

  console.error(`[local-server] ${req.method} ${req.path}:`, error)
  res.status(500).json({ error: 'Something went wrong' })
}
