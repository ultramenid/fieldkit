import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storageClient, STORAGE_BUCKET } from '@/lib/storage'
import { randomUUID } from 'crypto'

const ABSOLUTE_MAX_SIZE = 100 * 1024 * 1024 // 100MB hard ceiling
const DEFAULT_MAX_SIZE = 20 * 1024 * 1024
const DEFAULT_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const KNOWN_EXTENSIONS: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/gif': ['gif'],
  'application/pdf': ['pdf'],
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { filename, contentType, size, maxSize, allowedTypes } = body as {
    filename: unknown
    contentType: unknown
    size: unknown
    maxSize?: unknown
    allowedTypes?: unknown
  }

  if (typeof filename !== 'string' || typeof contentType !== 'string' || typeof size !== 'number') {
    return Response.json({ error: 'Missing or invalid filename, contentType, or size' }, { status: 400 })
  }

  // Use field-specific limits if provided, otherwise default
  const effectiveMaxSize = typeof maxSize === 'number' && maxSize > 0 ? Math.min(maxSize, ABSOLUTE_MAX_SIZE) : DEFAULT_MAX_SIZE
  const effectiveAllowedTypes = Array.isArray(allowedTypes) && allowedTypes.length > 0
    ? allowedTypes.filter((t): t is string => typeof t === 'string')
    : DEFAULT_ALLOWED_TYPES

  if (size <= 0 || size > effectiveMaxSize) {
    const maxMB = Math.round((effectiveMaxSize / (1024 * 1024)) * 10) / 10
    return Response.json({ error: `File too large (max ${maxMB}MB)` }, { status: 400 })
  }

  if (!effectiveAllowedTypes.includes(contentType)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const ext = (filename.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const validExts = effectiveAllowedTypes.flatMap((t) => KNOWN_EXTENSIONS[t] ?? [])
  if (!ext || validExts.length === 0 || !validExts.includes(ext)) {
    return Response.json({ error: 'File extension not allowed' }, { status: 400 })
  }

  const key = `uploads/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    ContentType: contentType,
  })

  const uploadUrl = await getSignedUrl(storageClient, command, { expiresIn: 300 })

  const fileUrl = `${process.env.S3_ENDPOINT}/${STORAGE_BUCKET}/${key}`

  return Response.json({ uploadUrl, fileUrl, key })
}
