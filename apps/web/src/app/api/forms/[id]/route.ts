import { NextResponse } from 'next/server'
import { fieldSchema, formSettingsSchema, formConfigSchema } from '@fieldkit/form-schema'
import { z } from 'zod'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { ApiError, badRequest, notFound, unauthorized, withApiErrorHandling } from '@/lib/api-errors'

const formUpdatePayloadSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  fields: z.array(fieldSchema).max(200).optional(),
  settings: formSettingsSchema.partial().optional(),
  published: z.boolean().optional(),
  closed: z.boolean().optional(),
  allowMultipleSubmissions: z.boolean().optional(),
  version: z.number().int().min(0).optional(),
})

export const GET = withApiErrorHandling('forms:get', async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) throw notFound()
  return NextResponse.json(form)
})

export const PATCH = withApiErrorHandling('forms:update', async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw badRequest('Invalid JSON')
  }

  const parsedBody = formUpdatePayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    throw badRequest('Invalid payload')
  }

  const { title, description, fields, settings, published, closed, allowMultipleSubmissions, version } = parsedBody.data

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) throw notFound()

  const existingSchema = formConfigSchema.pick({ fields: true, settings: true }).partial().safeParse(form.schema)
  const existingFields = existingSchema.success ? existingSchema.data.fields : []
  const existingSettings = existingSchema.success ? existingSchema.data.settings : undefined
  const expectedVersion = typeof version === 'number' ? version : form.version

  const result = await db.form.updateMany({
    where: { id: id, userId: session.user.id, version: expectedVersion },
    data: {
      title: title ?? form.title,
      description: description ?? form.description,
      schema: {
        fields: fields ?? existingFields,
        settings: {
          ...(existingSettings ?? {}),
          ...(settings ?? {}),
          ...(allowMultipleSubmissions !== undefined ? { allowMultipleSubmissions } : {}),
        },
      } as object,
      ...(published !== undefined ? { published } : {}),
      ...(closed !== undefined ? { closed } : {}),
      version: { increment: 1 },
    },
  })

  if (result.count === 0) {
    throw new ApiError('Conflict — form was modified since last read. Please refresh.', 409, true)
  }

  return NextResponse.json({ ok: true, version: expectedVersion + 1 })
})

export const DELETE = withApiErrorHandling('forms:delete', async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })
  if (!form) throw notFound()

  await db.form.delete({ where: { id: id } })
  return NextResponse.json({ ok: true })
})
