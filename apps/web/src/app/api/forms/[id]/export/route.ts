import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const IMG_SRC_RE = /<img\s[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const contentType = res.headers.get('content-type') ?? 'image/png'
  const buffer = Buffer.from(await res.arrayBuffer())
  const b64 = buffer.toString('base64')
  return `data:${contentType};base64,${b64}`
}

async function inlineImages(html: string): Promise<string> {
  const matches = [...html.matchAll(IMG_SRC_RE)]
  const replacements: { src: string; replacement: string; index: number }[] = []

  const results = await Promise.allSettled(
    matches.map(async (m) => {
      const src = m[1]
      if (src.startsWith('data:')) return { src, replacement: src }
      const b64 = await fetchImageAsBase64(src)
      return { src, replacement: b64 }
    })
  )

  const map = new Map<string, string>()
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      map.set(matches[i][1], r.value.replacement)
    }
  })

  return html.replace(IMG_SRC_RE, (full, src) => {
    const replacement = map.get(src)
    return replacement ? full.replace(src, replacement) : full
  })
}

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

  const description = await inlineImages(form.description)

  const config = {
    formId: form.id,
    title: form.title,
    description,
    version: form.version,
    exportedAt: new Date().toISOString(),
    ...(form.schema as Record<string, unknown>),
  }

  return NextResponse.json(config)
}
