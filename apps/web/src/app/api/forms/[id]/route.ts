import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEV_USER_ID } from '@/lib/dev-auth'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const form = await db.form.findFirst({
    where: { id: params.id, userId: DEV_USER_ID },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(form)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json()
  const { title, description, fields, settings, published } = body

  const form = await db.form.findFirst({
    where: { id: params.id, userId: DEV_USER_ID },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.form.update({
    where: { id: params.id },
    data: {
      title: title ?? form.title,
      description: description ?? form.description,
      schema: { fields: fields ?? [], settings: settings ?? {} },
      ...(published !== undefined ? { published } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}
