import express from 'express'
import path from 'path'
import os from 'os'
import fs from 'fs'
import multer from 'multer'
import { db, initDb } from './db'
import type { FormConfig } from '@fieldkit/form-schema'

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

export function createServer(dataDir: string, port: number) {
  initDb(dataDir)

  // SSE clients per form: formId → set of response objects
  const sseClients = new Map<string, Set<{ res: import('express').Response }>>()

  function notifyClients(formId: string) {
    const clients = sseClients.get(formId)
    if (!clients) return
    const responses = db.getResponses(formId)
    const data = JSON.stringify({ type: 'update', responses })
    clients.forEach(({ res }) => {
      res.write(`data: ${data}\n\n`)
    })
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
        cb(new Error('File type not allowed'))
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

  app.use(express.json({ limit: '10mb' }))
  // Serve uploads as forced downloads with safe content type — prevents stored XSS
  app.get('/uploads/:filename', (req, res) => {
    const filename = path.basename(req.params.filename)
    if (!filename || filename.includes('..')) return res.status(400).send('Invalid')
    const filePath = path.join(uploadsDir, filename)
    if (!fs.existsSync(filePath)) return res.status(404).send('Not found')
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.sendFile(filePath)
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
    const result = forms.map(f => ({
      ...f,
      responseCount: db.getResponses(f.id).length,
      pendingSync: db.getResponses(f.id).filter(r => !r.synced).length,
    }))
    res.json(result)
  })

  app.post('/api/forms/import', (req, res) => {
    const config = req.body as FormConfig & { formId?: string; id?: string }
    const id = config.formId ?? (config as { id?: string }).id
    if (!id || typeof id !== 'string' || !config.title || typeof config.title !== 'string') {
      return res.status(400).json({ error: 'Invalid config: missing formId or title' })
    }
    if (id.length > 128 || config.title.length > 500) {
      return res.status(400).json({ error: 'Invalid config: fields too long' })
    }
    const result = db.upsertForm(config as unknown as Record<string, unknown> & { title: string })
    res.json({ ok: true, ...result })
  })

  app.delete('/api/forms/:id', (req, res) => {
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).json({ error: 'Invalid form ID' })
    db.deleteForm(id)
    res.json({ ok: true })
  })

  app.get('/api/forms/:id/responses', (req, res) => {
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).json({ error: 'Invalid form ID' })
    res.json(db.getResponses(id))
  })

  app.get('/api/forms/:id/export', (req, res) => {
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).json({ error: 'Invalid form ID' })
    const form = db.getForm(id)
    if (!form) return res.status(404).json({ error: 'Form not found' })

    const responses = db.getResponses(id)

    const files: Record<string, string> = {}

    const exportedResponses = responses.map(r => {
      const answers = ((r.data as { answers?: unknown[] }).answers ?? []) as { fieldId: string; value: unknown }[]
      const processedAnswers = answers.map(a => {
        if (typeof a.value === 'string' && a.value.startsWith('/uploads/')) {
          const filename = path.basename(a.value)
          const filePath = path.join(uploadsDir, filename)
          if (fs.existsSync(filePath) && !files[a.value]) {
            files[a.value] = fs.readFileSync(filePath).toString('base64')
          }
        }
        return a
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
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).json({ error: 'Invalid form ID' })
    const form = db.getForm(id)
    if (!form) return res.status(404).json({ error: 'Form not found' })
    res.json(form)
  })

  app.post('/api/form/:id/submit', (req, res) => {
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).json({ error: 'Invalid form ID' })
    const form = db.getForm(id)
    if (!form) return res.status(404).json({ error: 'Form not found' })
    if (!req.body || typeof req.body !== 'object') return res.status(400).json({ error: 'Invalid submission' })
    const submissionId = db.addResponse(id, req.body)
    notifyClients(id)
    res.json({ ok: true, submissionId })
  })

  // ── SSE for real-time responses ────────────────────────────

  app.get('/api/forms/:id/stream', (req, res) => {
    const id = req.params.id
    if (!id || id.includes('/') || id.includes('..')) return res.status(400).end()

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
      sseClients.get(id)?.delete(client)
    })
  })

  // ── File upload ─────────────────────────────────────────

  app.post('/api/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        const message = err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE'
          ? 'File too large (max 10MB)'
          : err.message || 'Upload failed'
        return res.status(400).json({ error: message })
      }
      if (!req.file) return res.status(400).json({ error: 'No file provided' })
      const fileUrl = `/uploads/${req.file.filename}`
      // Sanitize originalname before returning — prevent stored XSS
      const safeOriginalName = req.file.originalname
        .replace(/[<>"'&]/g, '')
        .slice(0, 255)
      res.json({ fileUrl, filename: safeOriginalName })
    })
  })

  // ── Page routes ────────────────────────────────────────────

  app.get('/form/:id', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'))
  })

  app.get('/responses/:id', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'responses.html'))
  })

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

  return app
}
