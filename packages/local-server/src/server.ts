import express from 'express'
import path from 'path'
import { db, initDb } from './db'
import type { FormConfig } from '@fieldkit/form-schema'

export function createServer(dataDir: string, port: number) {
  initDb(dataDir)
  const app = express()

  app.use(express.json({ limit: '10mb' }))
  app.use(express.static(path.join(__dirname, 'public')))

  // ── Admin API ──────────────────────────────────────────────

  app.get('/api/status', (_req, res) => {
    const stats = db.getStats()
    res.json({ status: 'running', port, ...stats })
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
    if (!id || !config.title) {
      return res.status(400).json({ error: 'Invalid config: missing formId or title' })
    }
    const result = db.upsertForm(config as unknown as Record<string, unknown> & { title: string })
    res.json({ ok: true, ...result })
  })

  app.delete('/api/forms/:id', (req, res) => {
    db.deleteForm(req.params.id)
    res.json({ ok: true })
  })

  app.get('/api/forms/:id/responses', (req, res) => {
    res.json(db.getResponses(req.params.id))
  })

  app.get('/api/forms/:id/export', (req, res) => {
    const form = db.getForm(req.params.id)
    if (!form) return res.status(404).json({ error: 'Form not found' })

    const responses = db.getResponses(req.params.id)
    const exportData = {
      formId: req.params.id,
      exportedAt: new Date().toISOString(),
      responses: responses.map(r => ({
        submissionId: r.submissionId,
        formId: req.params.id,
        submittedAt: r.submittedAt,
        source: 'local',
        answers: (r.data as { answers?: unknown[] }).answers ?? [],
      })),
    }

    db.markSynced(req.params.id)
    res.setHeader('Content-Disposition', `attachment; filename="${form.title.replace(/\s+/g, '-')}-responses.json"`)
    res.json(exportData)
  })

  // ── Public form API ────────────────────────────────────────

  app.get('/api/form/:id', (req, res) => {
    const form = db.getForm(req.params.id)
    if (!form) return res.status(404).json({ error: 'Form not found' })
    res.json(form)
  })

  app.post('/api/form/:id/submit', (req, res) => {
    const form = db.getForm(req.params.id)
    if (!form) return res.status(404).json({ error: 'Form not found' })
    const submissionId = db.addResponse(req.params.id, req.body)
    res.json({ ok: true, submissionId })
  })

  // ── Page routes ────────────────────────────────────────────

  app.get('/form/:id', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'form.html'))
  })

  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
  })

  return app
}
