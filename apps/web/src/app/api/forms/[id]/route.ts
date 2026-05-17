import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(form)
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, description, fields, settings, published } = body

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
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

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
  })
  if (!form) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.form.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
