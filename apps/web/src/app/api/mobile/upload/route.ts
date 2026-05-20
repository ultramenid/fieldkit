import { PutObjectCommand } from '@aws-sdk/client-s3'
import { storageClient, STORAGE_BUCKET } from '@/lib/storage'
import { NextResponse } from 'next/server'

const ABSOLUTE_MAX_SIZE = 50 * 1024 * 1024 // 50MB hard ceiling
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]

const EXT_FROM_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

const TYPE_FROM_EXT: Record<string, string> = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp',
  'gif': 'image/gif',
  'pdf': 'application/pdf',
}

function guessTypeFromName(name: string): string {
  const ext = (name.split('.').pop() ?? '').toLowerCase()
  return TYPE_FROM_EXT[ext] ?? 'image/jpeg'
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') ?? ''

  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Detect content type from file metadata or filename extension
  const filename = file.name || 'upload'
  const detectedType = file.type && file.type !== 'application/octet-stream'
    ? file.type
    : guessTypeFromName(filename)

  if (!ALLOWED_TYPES.includes(detectedType)) {
    return NextResponse.json({ error: `File type not allowed: ${detectedType}` }, { status: 400 })
  }

  // Validate size
  if (file.size <= 0 || file.size > ABSOLUTE_MAX_SIZE) {
    const maxMB = Math.round(ABSOLUTE_MAX_SIZE / (1024 * 1024))
    return NextResponse.json({ error: `File too large (max ${maxMB}MB)` }, { status: 400 })
  }

  // Determine extension from detected content type, fall back to filename
  const ext = EXT_FROM_TYPE[detectedType] ?? (filename.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin')
  const key = `uploads/mobile/${Date.now()}-${crypto.randomUUID()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  await storageClient.send(new PutObjectCommand({
    Bucket: STORAGE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: detectedType,
    ContentLength: buffer.length,
  }))

  const fileUrl = `${process.env.S3_ENDPOINT}/${STORAGE_BUCKET}/${key}`
  return NextResponse.json({ fileUrl, key, size: buffer.length })
}
