import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { storageClient, STORAGE_BUCKET } from '@/lib/storage'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { badRequest, withApiErrorHandling } from '@/lib/api-errors'
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

const uploadPayloadSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().positive(),
  maxSize: z.number().positive().optional(),
  allowedTypes: z.array(z.string()).optional(),
})

export const POST = withApiErrorHandling('upload:create-url', async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    throw badRequest('Invalid JSON')
  }

  const parsedBody = uploadPayloadSchema.safeParse(body)
  if (!parsedBody.success) {
    throw badRequest('Invalid payload')
  }

  const { filename, contentType, size, maxSize, allowedTypes } = parsedBody.data

  const effectiveMaxSize = maxSize ? Math.min(maxSize, ABSOLUTE_MAX_SIZE) : DEFAULT_MAX_SIZE
  const effectiveAllowedTypes = allowedTypes?.filter((type) => KNOWN_EXTENSIONS[type] !== undefined)
  const safeAllowedTypes = effectiveAllowedTypes?.length ? effectiveAllowedTypes : DEFAULT_ALLOWED_TYPES

  if (size <= 0 || size > effectiveMaxSize) {
    const maxMB = Math.round((effectiveMaxSize / (1024 * 1024)) * 10) / 10
    throw badRequest(`File too large (max ${maxMB}MB)`)
  }

  if (!safeAllowedTypes.includes(contentType)) {
    throw badRequest('File type not allowed')
  }

  const ext = (filename.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const validExts = KNOWN_EXTENSIONS[contentType] ?? []
  if (!ext || validExts.length === 0 || !validExts.includes(ext)) {
    throw badRequest('File extension not allowed')
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
})
