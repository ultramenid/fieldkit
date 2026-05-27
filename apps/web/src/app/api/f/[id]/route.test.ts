import { describe, it, expect, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    form: { findFirst: vi.fn() },
    response: { create: vi.fn() },
  },
}))

import { POST } from './route'
import { db } from '@/lib/db'

function buildRequest(body?: unknown, overrides?: Partial<RequestInit>): Request {
  const req = new Request('http://localhost/api/f/form-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    ...overrides,
  })
  return req
}

async function jsonBody(res: Response): Promise<unknown> {
  return res.json()
}

describe('POST f/[id] — public form submission', () => {
  it('rejects invalid JSON body', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    const req = new Request('http://localhost/api/f/form-1', {
      method: 'POST',
      body: 'not-json',
    })

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid JSON' })
  })

  it('rejects missing answers field', async () => {
    const req = buildRequest({})
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects oversized answers array', async () => {
    const req = buildRequest({ answers: Array.from({ length: 201 }, () => ({})) })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects missing form ID', async () => {
    const req = buildRequest({ answers: [] })

    const res = await POST(req, { params: Promise.resolve({ id: '' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid form ID' })
  })

  it('rejects overly long form ID', async () => {
    const req = buildRequest({ answers: [] })

    const res = await POST(req, { params: Promise.resolve({ id: 'a'.repeat(129) }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid form ID' })
  })

  it('returns 404 when form not found', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: 'test' }] })
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(404)
    expect(await jsonBody(res)).toEqual({ error: 'Form not available' })
  })

  it('returns 404 when form is unpublished', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: 'test' }] })
    // Prisma WHERE requires published:true — mock returns null to simulate no match
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(404)
  })

  it('returns 404 when form is closed', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: 'test' }] })
    // Prisma WHERE requires closed:false — mock returns null to simulate no match
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(404)
  })

  it('truncates long string values', async () => {
    const longValue = 'x'.repeat(70000)
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: longValue }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    const savedValue = createCall.data.data.answers[0].value
    expect(savedValue.length).toBe(65536)
  })

  it('truncates oversized arrays', async () => {
    const bigArray = Array.from({ length: 300 }, (_, i) => `item-${i}`)
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: bigArray }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    const savedValue = createCall.data.data.answers[0].value
    expect(savedValue.length).toBe(200)
  })

  it('truncates long string items in arrays', async () => {
    const longStrings = Array.from({ length: 5 }, () => 'y'.repeat(2000))
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: longStrings }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    const savedValue = createCall.data.data.answers[0].value
    savedValue.forEach((v: string) => {
      expect(v.length).toBe(1024)
    })
  })

  it('truncates long fieldIds', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f'.repeat(200), value: 'test' }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    const savedFieldId = createCall.data.data.answers[0].fieldId
    expect(savedFieldId.length).toBe(128)
  })

  it('returns { ok: true } on success with a UUID submissionId', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f1', value: 'hello' }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    expect(await jsonBody(res)).toEqual({ ok: true })

    const createCall = (db.response.create as Mock).mock.calls[0][0]
    expect(createCall.data.submissionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    )
    expect(createCall.data.source).toBe('online')
    expect(createCall.data.formId).toBe('form-1')
  })

  it('defaults missing fieldId to empty string', async () => {
    const req = buildRequest({ answers: [{ value: 'no field' }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    expect(createCall.data.data.answers[0].fieldId).toBe('')
  })

  it('defaults missing value to null', async () => {
    const req = buildRequest({ answers: [{ fieldId: 'f1' }] })
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'form-1',
      published: true,
      closed: false,
    })
    ;(db.response.create as Mock).mockResolvedValue({})

    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const createCall = (db.response.create as Mock).mock.calls[0][0]
    expect(createCall.data.data.answers[0].value).toBeNull()
  })
})
