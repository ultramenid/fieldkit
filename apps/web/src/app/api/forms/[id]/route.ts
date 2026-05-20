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
    where: { id: id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(form)
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { title, description, fields, settings, published, closed, allowMultipleSubmissions, version } = body as Record<string, unknown>

  if (title !== undefined && (typeof title !== 'string' || title.length > 500)) {
    return NextResponse.json({ error: 'Invalid title' }, { status: 400 })
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 5000)) {
    return NextResponse.json({ error: 'Invalid description' }, { status: 400 })
  }
  if (fields !== undefined && (!Array.isArray(fields) || fields.length > 200)) {
    return NextResponse.json({ error: 'Invalid fields' }, { status: 400 })
  }
  if (published !== undefined && typeof published !== 'boolean') {
    return NextResponse.json({ error: 'Invalid published value' }, { status: 400 })
  }
  if (closed !== undefined && typeof closed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid closed value' }, { status: 400 })
  }
  if (version !== undefined && (typeof version !== 'number' || !Number.isInteger(version) || version < 0)) {
    return NextResponse.json({ error: 'Invalid version' }, { status: 400 })
  }

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existingSchema = form.schema as { fields?: unknown[]; settings?: Record<string, unknown> }
  const expectedVersion = typeof version === 'number' ? version : form.version

  const result = await db.form.updateMany({
    where: { id: id, userId: session.user.id, version: expectedVersion },
    data: {
      title: (title as string) ?? form.title,
      description: (description as string) ?? form.description,
      schema: {
        fields: (fields ?? existingSchema.fields ?? []) as object[],
        settings: {
          ...(existingSchema.settings ?? {}),
          ...((settings as Record<string, unknown>) ?? {}),
          ...(allowMultipleSubmissions !== undefined ? { allowMultipleSubmissions } : {}),
        },
      } as object,
      ...(published !== undefined ? { published: published as boolean } : {}),
      ...(closed !== undefined ? { closed: closed as boolean } : {}),
      version: { increment: 1 },
    },
  })

  if (result.count === 0) {
    return NextResponse.json({ error: 'Conflict — form was modified since last read. Please refresh.' }, { status: 409 })
  }

  return NextResponse.json({ ok: true, version: expectedVersion + 1 })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.form.delete({ where: { id: id } })
  return NextResponse.json({ ok: true })
}
