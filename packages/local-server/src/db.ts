import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export interface Form {
  id: string
  title: string
  description: string
  schema: Record<string, unknown>
  version: number
  importedAt: string
}

export interface Response {
  id: string
  formId: string
  submissionId: string
  data: Record<string, unknown>
  submittedAt: string
  synced: boolean
}

interface DbData {
  forms: Form[]
  responses: Response[]
}

let dataDir: string
let dbPath: string
let cache: DbData | null = null

export function initDb(dir: string) {
  dataDir = dir
  dbPath = path.join(dir, 'db.json')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ forms: [], responses: [] }, null, 2))
  }
  cache = null
}

function read(): DbData {
  if (cache) return cache
  cache = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) as DbData
  return cache
}

function write(data: DbData) {
  cache = data
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2))
}

export const db = {
  getForms(): Form[] {
    return read().forms
  },

  getForm(id: string): Form | undefined {
    return read().forms.find(f => f.id === id)
  },

  upsertForm(config: Record<string, unknown> & { formId?: string; id?: string; title: string; description?: string; version?: number }): { action: 'imported' | 'updated'; id: string } {
    const data = read()
    const id = (config.formId ?? config.id) as string
    const existing = data.forms.findIndex(f => f.id === id)
    const form: Form = {
      id,
      title: config.title,
      description: (config.description as string) ?? '',
      schema: config as Record<string, unknown>,
      version: (config.version as number) ?? 1,
      importedAt: new Date().toISOString(),
    }
    if (existing >= 0) {
      data.forms[existing] = { ...form, importedAt: data.forms[existing].importedAt }
      write(data)
      return { action: 'updated', id }
    }
    data.forms.push(form)
    write(data)
    return { action: 'imported', id }
  },

  deleteForm(id: string) {
    const data = read()
    data.forms = data.forms.filter(f => f.id !== id)
    data.responses = data.responses.filter(r => r.formId !== id)
    write(data)
  },

  getResponses(formId: string): Response[] {
    return read().responses.filter(r => r.formId === formId)
  },

  addResponse(formId: string, answers: Record<string, unknown>): string {
    const data = read()
    const submissionId = uuidv4()
    data.responses.push({
      id: uuidv4(),
      formId,
      submissionId,
      data: { answers },
      submittedAt: new Date().toISOString(),
      synced: false,
    })
    write(data)
    return submissionId
  },

  markSynced(formId: string) {
    const data = read()
    data.responses = data.responses.map(r =>
      r.formId === formId ? { ...r, synced: true } : r
    )
    write(data)
  },

  getStats() {
    const data = read()
    return {
      formCount: data.forms.length,
      responseCount: data.responses.length,
      pendingSync: data.responses.filter(r => !r.synced).length,
    }
  },
}
