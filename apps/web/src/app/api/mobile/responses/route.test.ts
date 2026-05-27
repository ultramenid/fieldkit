import { describe, it, expect, vi, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    form: { findFirst: vi.fn() },
    response: { createMany: vi.fn() },
  },
}))

import { POST } from './route'
import { db } from '@/lib/db'

function buildRequest(body?: unknown): Request {
  return new Request('http://localhost/api/mobile/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function jsonBody(res: Response): Promise<unknown> {
  return res.json()
}

describe('POST mobile/responses — mobile sync', () => {
  it('rejects invalid JSON', async () => {
    const req = new Request('http://localhost/api/mobile/responses', {
      method: 'POST',
      body: 'not-json',
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid JSON' })
  })

  it('rejects missing formId', async () => {
    const req = buildRequest({ secret: 's1', responses: [{ submissionId: 'sub-1', answers: [] }] })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects missing secret', async () => {
    const req = buildRequest({ formId: 'f1', responses: [{ submissionId: 'sub-1', answers: [] }] })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects empty responses array', async () => {
    const req = buildRequest({ formId: 'f1', secret: 's1', responses: [] })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects oversized responses array', async () => {
    const req = buildRequest({
      formId: 'f1',
      secret: 's1',
      responses: Array.from({ length: 501 }, () => ({ submissionId: 's', answers: [] })),
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects response with missing submissionId', async () => {
    const req = buildRequest({
      formId: 'f1',
      secret: 's1',
      responses: [{ answers: [] }],
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects response with oversized answers', async () => {
    const req = buildRequest({
      formId: 'f1',
      secret: 's1',
      responses: [{ submissionId: 'sub-1', answers: Array.from({ length: 201 }, () => ({})) }],
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects wrong secret', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: 'correct-secret',
    })

    const req = buildRequest({
      formId: 'f1',
      secret: 'wrong-secret',
      responses: [{ submissionId: 'sub-1', answers: [{ fieldId: 'f1', value: 'test' }] }],
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid form or secret' })
  })

  it('rejects when form has no mobileSecret', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: null,
    })

    const req = buildRequest({
      formId: 'f1',
      secret: 'some-secret',
      responses: [{ submissionId: 'sub-1', answers: [] }],
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid form or secret' })
  })

  it('rejects when form not found', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const req = buildRequest({
      formId: 'f1',
      secret: 'secret',
      responses: [{ submissionId: 'sub-1', answers: [] }],
    })

    const res = await POST(req)

    expect(res.status).toBe(401)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid form or secret' })
  })

  it('returns ok with imported and duplicates on success', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: 'secret',
    })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 2 })

    const req = buildRequest({
      formId: 'f1',
      secret: 'secret',
      responses: Array.from({ length: 3 }, (_, i) => ({
        submissionId: `sub-${i}`,
        answers: [{ fieldId: 'f1', value: `val-${i}` }],
      })),
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(await jsonBody(res)).toEqual({ ok: true, imported: 2, duplicates: 1 })
  })

  it('defaults source to mobile when omitted', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: 'secret',
    })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    const req = buildRequest({
      formId: 'f1',
      secret: 'secret',
      responses: [{ submissionId: 'sub-1', answers: [] }],
    })

    await POST(req)

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.data[0].source).toBe('mobile')
  })

  it('passes skipDuplicates: true to createMany', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: 'secret',
    })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    const req = buildRequest({
      formId: 'f1',
      secret: 'secret',
      responses: [{ submissionId: 'sub-1', answers: [] }],
    })

    await POST(req)

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.skipDuplicates).toBe(true)
  })

  it('passes answers as data to createMany', async () => {
    ;(db.form.findFirst as Mock).mockResolvedValue({
      id: 'f1',
      mobileSecret: 'secret',
    })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    const answers = [{ fieldId: 'f1', value: 'hello' }]
    const req = buildRequest({
      formId: 'f1',
      secret: 'secret',
      responses: [{ submissionId: 'sub-1', answers }],
    })

    await POST(req)

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.data[0].data).toEqual({ answers })
    expect(args.data[0].formId).toBe('f1')
    expect(args.data[0].submissionId).toBe('sub-1')
  })
})
