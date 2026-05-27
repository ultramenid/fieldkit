import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'

vi.mock('@/lib/db', () => ({
  db: {
    form: { findFirst: vi.fn() },
    response: {
      createMany: vi.fn(),
      count: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

import { POST, GET } from './route'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

function buildRequest(url?: string, body?: unknown): Request {
  return new Request(url ?? 'http://localhost/api/forms/form-1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

async function jsonBody(res: Response): Promise<unknown> {
  return res.json()
}

describe('POST forms/[id]/responses — import responses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated request', async () => {
    ;(auth as Mock).mockResolvedValue(null)

    const res = await POST(buildRequest(), { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(401)
    expect(await jsonBody(res)).toEqual({ error: 'Unauthorized' })
  })

  it('rejects session with no user id', async () => {
    ;(auth as Mock).mockResolvedValue({ user: {} })

    const res = await POST(buildRequest(), { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(401)
  })

  it('returns 404 when form not found', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const res = await POST(buildRequest(), { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(404)
    expect(await jsonBody(res)).toEqual({ error: 'Not found' })
  })

  it('rejects invalid JSON', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })

    const req = new Request('http://localhost/api/forms/form-1/responses', {
      method: 'POST',
      body: 'not-json',
    })
    const res = await POST(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid JSON' })
  })

  it('rejects missing responses field', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })

    const res = await POST(buildRequest(undefined, {}), { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects oversized responses array', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })

    const res = await POST(
      buildRequest(undefined, { responses: Array.from({ length: 501 }, () => ({ submissionId: 's' })) }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('rejects response with missing submissionId', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })

    const res = await POST(
      buildRequest(undefined, { responses: [{}] }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    expect(res.status).toBe(400)
    expect(await jsonBody(res)).toEqual({ error: 'Invalid payload' })
  })

  it('returns imported count with all new responses', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 5 })

    const res = await POST(
      buildRequest(undefined, { responses: Array.from({ length: 5 }, (_, i) => ({ submissionId: `sub-${i}` })) }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    expect(res.status).toBe(200)
    expect(await jsonBody(res)).toEqual({ imported: 5, duplicates: 0 })
  })

  it('returns duplicates count when some are skipped', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 7 })

    const res = await POST(
      buildRequest(undefined, { responses: Array.from({ length: 10 }, (_, i) => ({ submissionId: `sub-${i}` })) }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    expect(res.status).toBe(200)
    expect(await jsonBody(res)).toEqual({ imported: 7, duplicates: 3 })
  })

  it('returns all duplicates when nothing new', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 0 })

    const res = await POST(
      buildRequest(undefined, { responses: Array.from({ length: 3 }, (_, i) => ({ submissionId: `sub-${i}` })) }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    expect(res.status).toBe(200)
    expect(await jsonBody(res)).toEqual({ imported: 0, duplicates: 3 })
  })

  it('passes skipDuplicates: true to createMany', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    await POST(
      buildRequest(undefined, { responses: [{ submissionId: 'sub-1' }] }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.skipDuplicates).toBe(true)
  })

  it('defaults source to local when omitted', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    await POST(
      buildRequest(undefined, { responses: [{ submissionId: 'sub-1' }] }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.data[0].source).toBe('local')
  })

  it('defaults submittedAt to current date when omitted', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.createMany as Mock).mockResolvedValue({ count: 1 })

    const before = new Date()
    await POST(
      buildRequest(undefined, { responses: [{ submissionId: 'sub-1' }] }),
      { params: Promise.resolve({ id: 'form-1' }) },
    )

    const args = (db.response.createMany as Mock).mock.calls[0][0]
    expect(args.data[0].submittedAt).toBeInstanceOf(Date)
    expect(args.data[0].submittedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
  })
})

describe('GET forms/[id]/responses — list responses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects unauthenticated request', async () => {
    ;(auth as Mock).mockResolvedValue(null)

    const req = new Request('http://localhost/api/forms/form-1/responses')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(401)
  })

  it('returns 404 when form not found', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue(null)

    const req = new Request('http://localhost/api/forms/form-1/responses')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(404)
  })

  it('returns empty responses with pagination', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.count as Mock).mockResolvedValue(0)
    ;(db.response.findMany as Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/forms/form-1/responses')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const body = (await jsonBody(res)) as Record<string, unknown>
    expect(body.responses).toEqual([])
    expect(body.pagination).toEqual({ page: 1, pageSize: 25, total: 0, totalPages: 1 })
  })

  it('returns paginated responses', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.count as Mock).mockResolvedValue(50)
    ;(db.response.findMany as Mock).mockResolvedValue(
      Array.from({ length: 25 }, (_, i) => ({ id: `r-${i}`, submissionId: `sub-${i}` })),
    )

    const req = new Request('http://localhost/api/forms/form-1/responses')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const body = (await jsonBody(res)) as Record<string, unknown>
    expect((body.responses as unknown[]).length).toBe(25)
    expect(body.pagination).toEqual({ page: 1, pageSize: 25, total: 50, totalPages: 2 })
  })

  it('honours page and pageSize query params', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.count as Mock).mockResolvedValue(100)
    ;(db.response.findMany as Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/forms/form-1/responses?page=3&pageSize=50')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const body = (await jsonBody(res)) as Record<string, unknown>
    expect(body.pagination).toEqual({ page: 2, pageSize: 50, total: 100, totalPages: 2 })
  })

  it('clamps invalid page to 1', async () => {
    ;(auth as Mock).mockResolvedValue({ user: { id: 'user-1' } })
    ;(db.form.findFirst as Mock).mockResolvedValue({ id: 'form-1', userId: 'user-1' })
    ;(db.response.count as Mock).mockResolvedValue(30)
    ;(db.response.findMany as Mock).mockResolvedValue([])

    const req = new Request('http://localhost/api/forms/form-1/responses?page=0&pageSize=10')
    const res = await GET(req, { params: Promise.resolve({ id: 'form-1' }) })

    expect(res.status).toBe(200)
    const body = (await jsonBody(res)) as Record<string, unknown>
    expect(body.pagination).toEqual({ page: 1, pageSize: 10, total: 30, totalPages: 3 })
  })
})
