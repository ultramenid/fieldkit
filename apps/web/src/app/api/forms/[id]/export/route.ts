import { NextResponse } from 'next/server'
import { lookup } from 'node:dns/promises'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const IMG_SRC_RE = /<img\s+[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi
const MAX_IMAGE_BYTES = 10 * 1024 * 1024 // 10MB

const PRIVATE_IP_RANGES = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^0\./,
  /^169\.254\./,
  /^::1$/,
  /^fc00:/i,
  /^fe80:/i,
]

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_RANGES.some((r) => r.test(ip))
}


function getStorageHostname(): string | null {
  const endpoint = process.env.S3_ENDPOINT
  if (!endpoint) return null
  try {
    return new URL(endpoint).hostname
  } catch {
    return null
  }
}

async function validateUrl(url: string): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Invalid URL')
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Blocked protocol: ' + parsed.protocol)
  }

  const hostname = parsed.hostname
  const storageHost = getStorageHostname()
  if (storageHost && hostname === storageHost) return

  if (hostname === 'localhost' || isPrivateIp(hostname)) {
    throw new Error('Blocked internal host')
  }

  const resolved = await lookup(hostname, { all: true })
  for (const addr of resolved) {
    if (isPrivateIp(addr.address)) {
      throw new Error('Blocked private IP: ' + addr.address)
    }
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  await validateUrl(url)

  const res = await fetch(url, { signal: AbortSignal.timeout(10000) })

  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

  const contentLength = res.headers.get('content-length')
  if (contentLength) {
    const size = parseInt(contentLength, 10)
    if (isNaN(size) || size > MAX_IMAGE_BYTES) {
      throw new Error('Image too large')
    }
  }

  const rawContentType = res.headers.get('content-type') ?? ''
  if (!rawContentType.startsWith('image/')) {
    throw new Error('Not an image: ' + rawContentType)
  }
  const contentType = rawContentType.split(';')[0].trim()

  const buffer = Buffer.from(await res.arrayBuffer())
  const b64 = buffer.toString('base64')
  return `data:${contentType};base64,${b64}`
}

async function inlineImages(html: string): Promise<string> {
  const matches = [...html.matchAll(IMG_SRC_RE)]

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
    } else {
      console.error('Image fetch failed for form export:', matches[i][1], r.reason)
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

  const description = await inlineImages(form.description ?? '')

  const schema = form.schema as Record<string, unknown>
  const config = {
    formId: form.id,
    ...(schema.fields !== undefined ? { fields: schema.fields } : {}),
    ...(schema.settings !== undefined ? { settings: schema.settings } : {}),
    title: form.title,
    description,
    version: form.version,
    exportedAt: new Date().toISOString(),
  }

  return NextResponse.json(config)
}
