import express from 'express'
import path from 'path'
import os from 'os'
import fs from 'fs'
import multer from 'multer'
import { badRequest, errorMiddleware, notFound } from './http-errors'
import { db, initDb } from './db'
import type { FormConfig } from './types'

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function getLanIp(): string {
  const interfaces = os.networkInterfaces()
  for (const iface of Object.values(interfaces)) {
    for (const addr of iface ?? []) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address
    }
  }
  return 'localhost'
}

function getParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

function formId(req: express.Request): string {
  return getParam(req.params.id)
}

export function createServer(dataDir: string, port: number) {
  initDb(dataDir)

  // SSE clients per form: formId → set of response objects
  const sseClients = new Map<string, Set<{ res: import('express').Response }>>()

  function notifyClients(formId: string) {
    const clients = sseClients.get(formId)
    if (!clients) return
    const responses = db.getResponses(formId)
    const data = JSON.stringify({ type: 'update', responses })
    clients.forEach((client) => {
      try {
        client.res.write(`data: ${data}\n\n`)
      } catch {
        clients.delete(client)
      }
    })
    if (clients.size === 0) sseClients.delete(formId)
  }

  const uploadsDir = path.join(dataDir, 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  const storage = multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, _file, cb) => {
      // No extension — prevents serving as executable content type
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`)
    },
  })

  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(badRequest('File type not allowed'))
      }
    },
  })

  const app = express()

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:")
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    next()
  })

  app.param('id', (req, _res, next, value) => {
    const id = getParam(value)
    if (!id || id.includes('/') || id.includes('..')) return next(badRequest('Invalid form ID'))
    req.params.id = id
    next()
  })

  app.use(express.json({ limit: '10mb' }))
  // Serve uploads as forced downloads with safe content type — prevents stored XSS
  app.get('/uploads/:filename', (req, res, next) => {
    const filename = path.basename(getParam(req.params.filename))
    if (!filename || filename.includes('..')) return next(badRequest('Invalid file'))
    const filePath = path.join(uploadsDir, filename)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.sendFile(filePath, (error) => {
      if (!error) return
      if ('status' in error && error.status === 404) return next(notFound())
      next(error)
    })
  })
  app.use(express.static(path.join(__dirname, 'public')))

  // ── Admin API ──────────────────────────────────────────────

  app.get('/api/status', (_req, res) => {
    const stats = db.getStats()
    const lanIp = getLanIp()
    res.json({
      status: 'running',
      port,
      lanIp,
      localUrl: `http://localhost:${port}`,
      lanUrl: `http://${lanIp}:${port}`,
      ...stats,
    })
  })

  app.get('/api/forms', (_req, res) => {
    const forms = db.getForms()
    const result = forms.map(f => {
      const responses = db.getResponses(f.id)
      return {
        ...f,
        responseCount: responses.length,
        pendingSync: responses.filter(r => !r.synced).length,
      }
    })
    res.json(result)
  })

  app.post('/api/forms/import', (req, res) => {
    const config = req.body as FormConfig & { formId?: string; id?: string }
    const id = config.formId ?? (config as { id?: string }).id
    if (!id || typeof id !== 'string' || !config.title || typeof config.title !== 'string') {
      throw badRequest('Invalid config: missing formId or title')
    }
    if (id.length > 128 || config.title.length > 500) {
      throw badRequest('Invalid config: fields too long')
    }
    const result = db.upsertForm(config as unknown as Record<string, unknown> & { title: string })
    res.json({ ok: true, ...result })
  })

  app.delete('/api/forms/:id', (req, res) => {
    const id = formId(req)
    db.deleteForm(id)
    res.json({ ok: true })
  })

  app.get('/api/forms/:id/responses', (req, res) => {
    const id = formId(req)
    res.json(db.getResponses(id))
  })

  app.get('/api/forms/:id/export', (req, res) => {
    const id = formId(req)
    const form = db.getForm(id)
    if (!form) throw notFound('Form not found')

    const responses = db.getResponses(id)
    // WARNING: must remain synchronous — adding await here introduces a read-then-write race

    const files: Record<string, string> = {}

    const exportedResponses = responses.map(r => {
      const rawAnswers = (r.data as { answers?: unknown }).answers
      const answers = Array.isArray(rawAnswers)
        ? rawAnswers
        : (rawAnswers && typeof rawAnswers === 'object' && Array.isArray((rawAnswers as { answers?: unknown }).answers)
            ? (rawAnswers as { answers: unknown[] }).answers
            : [])

      const processedAnswers = answers
        .filter((answer): answer is { fieldId?: unknown; value?: unknown } => !!answer && typeof answer === 'object')
        .map(answer => {
          const normalized = {
            fieldId: typeof answer.fieldId === 'string' ? answer.fieldId : String(answer.fieldId ?? ''),
            value: answer.value,
          }

          if (typeof normalized.value === 'string' && normalized.value.startsWith('/uploads/')) {
            const filename = path.basename(normalized.value)
            const filePath = path.join(uploadsDir, filename)
            if (fs.existsSync(filePath) && !files[normalized.value]) {
              files[normalized.value] = fs.readFileSync(filePath).toString('base64')
            }
          }

          return normalized
        })
      return {
        submissionId: r.submissionId,
        formId: id,
        submittedAt: r.submittedAt,
        source: 'local',
        answers: processedAnswers,
      }
    })

    const exportData = {
      formId: id,
      exportedAt: new Date().toISOString(),
      responses: exportedResponses,
      files,
    }

    db.markSynced(id)
    const safeFilename = form.title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '-')
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}-responses.json"`)
    res.json(exportData)
  })

  // ── Public form API ────────────────────────────────────────

  app.get('/api/form/:id', (req, res) => {
    const id = formId(req)
    const form = db.getForm(id)
    if (!form) throw notFound('Form not found')
    res.json(form)
  })

  app.post('/api/form/:id/submit', (req, res) => {
    const id = formId(req)
    const form = db.getForm(id)
    if (!form) throw notFound('Form not found')
    if (!req.body || typeof req.body !== 'object') throw badRequest('Invalid submission')
    const submissionId = db.addResponse(id, req.body, (req.body as { submissionId?: string }).submissionId)
    notifyClients(id)
    res.json({ ok: true, submissionId })
  })

  // ── SSE for real-time responses ────────────────────────────

  app.get('/api/forms/:id/stream', (req, res) => {
    const id = formId(req)

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    // Send current responses immediately
    const responses = db.getResponses(id)
    res.write(`data: ${JSON.stringify({ type: 'update', responses })}\n\n`)

    // Register client
    if (!sseClients.has(id)) sseClients.set(id, new Set())
    const client = { res }
    sseClients.get(id)!.add(client)

    // Clean up on disconnect
    req.on('close', () => {
      const clients = sseClients.get(id)
      clients?.delete(client)
      if (clients?.size === 0) sseClients.delete(id)
    })
  })

  // ── File upload ─────────────────────────────────────────

  app.post('/api/upload', (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
          return next(badRequest('File too large (max 10MB)'))
        }
        return next(err)
      }
      if (!req.file) return next(badRequest('No file provided'))
      const fileUrl = `/uploads/${req.file.filename}`
      // Sanitize originalname before returning — prevent stored XSS
      const safeOriginalName = req.file.originalname
        .replace(/[<>"'&]/g, '')
        .slice(0, 255)
      res.json({ fileUrl, filename: safeOriginalName })
    })
  })

  // ── Page routes ────────────────────────────────────────────

  app.get('/form/:id', (_req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'), next)
  })

  app.get('/responses/:id', (_req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'responses.html'), next)
  })

  app.get('*path', (_req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'), next)
  })

  app.use(errorMiddleware)

  return app
}
