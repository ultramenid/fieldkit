import { NextResponse } from 'next/server'

export class ApiError extends Error {
  status: number
  expose: boolean

  constructor(message: string, status = 500, expose = false) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.expose = expose
  }
}

export function badRequest(message: string): ApiError {
  return new ApiError(message, 400, true)
}

export function unauthorized(message = 'Unauthorized'): ApiError {
  return new ApiError(message, 401, true)
}

export function notFound(message = 'Not found'): ApiError {
  return new ApiError(message, 404, true)
}

export function handleApiError(error: unknown, context: string): NextResponse<{ error: string }> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.expose ? error.message : 'Something went wrong' },
      { status: error.status }
    )
  }

  console.error(`[api] ${context}:`, error)
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
}

type RouteContext = Record<string, unknown>
type RouteHandler<TContext extends RouteContext | undefined = undefined> = TContext extends undefined
  ? (req: Request) => Response | Promise<Response>
  : (req: Request, context: TContext) => Response | Promise<Response>

export function withApiErrorHandling<TContext extends RouteContext | undefined = undefined>(
  context: string,
  handler: RouteHandler<TContext>
): RouteHandler<TContext> {
  return (async (req: Request, routeContext?: TContext) => {
    try {
      if (routeContext === undefined) {
        return await (handler as (req: Request) => Response | Promise<Response>)(req)
      }
      return await (handler as (req: Request, context: TContext) => Response | Promise<Response>)(req, routeContext)
    } catch (error) {
      return handleApiError(error, context)
    }
  }) as RouteHandler<TContext>
}
