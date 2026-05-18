import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storageClient, STORAGE_BUCKET } from '@/lib/storage'
import { randomUUID } from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

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

  const { filename, contentType, size } = body as {
    filename: unknown
    contentType: unknown
    size: unknown
  }

  if (typeof filename !== 'string' || typeof contentType !== 'string' || typeof size !== 'number') {
    return Response.json({ error: 'Missing or invalid filename, contentType, or size' }, { status: 400 })
  }

  if (size <= 0 || size > MAX_SIZE) {
    return Response.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return Response.json({ error: 'File type not allowed' }, { status: 400 })
  }

  const ext = (filename.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
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
