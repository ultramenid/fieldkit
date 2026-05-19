import {
  getUnsyncedResponses,
  getUnsyncedResponsesByForm,
  markResponsesSynced,
  updateFormLastSynced,
  getForm,
} from '../db/database'
import { syncResponses } from '../api/server'
import { ResponseRecord } from '../types'

async function syncBatchForForm(formId: string, responses: ResponseRecord[]): Promise<{ synced: number; errors: number }> {
  if (responses.length === 0) return { synced: 0, errors: 0 }

  const form = await getForm(formId)
  if (!form) {
    console.error('[sync] form not found:', formId)
    return { synced: 0, errors: responses.length }
  }

  const batch = responses.slice(0, 20)

  try {
    const payload = batch.map((r) => {
      const data = JSON.parse(r.dataJson)
      return {
        submissionId: r.submissionId,
        submittedAt: new Date(r.submittedAt).toISOString(),
        answers: data.answers ?? [],
      }
    })
    console.log('[sync] posting to server:', { formId, payloadCount: payload.length, secret: form.secret?.slice(0, 4) + '…' })
    const result = await syncResponses(formId, form.secret, payload)
    console.log('[sync] server response:', JSON.stringify(result))

    if (!result.ok) {
      console.error('[sync] server returned not ok:', result)
      return { synced: 0, errors: batch.length }
    }

    await markResponsesSynced(batch.map((r) => r.id))
    await updateFormLastSynced(formId, Date.now())
    console.log('[sync] success:', { formId, synced: batch.length })
    return { synced: batch.length, errors: 0 }
  } catch (e) {
    console.error('[sync] error:', e)
    return { synced: 0, errors: batch.length }
  }
}

export async function syncAll(): Promise<{ synced: number; errors: number }> {
  const unsynced = await getUnsyncedResponses()
  if (unsynced.length === 0) return { synced: 0, errors: 0 }

  const grouped = new Map<string, ResponseRecord[]>()
  for (const r of unsynced) {
    const list = grouped.get(r.formId) || []
    list.push(r)
    grouped.set(r.formId, list)
  }

  let syncedCount = 0
  let errorCount = 0

  for (const [formId, responses] of grouped) {
    const result = await syncBatchForForm(formId, responses)
    syncedCount += result.synced
    errorCount += result.errors
  }

  return { synced: syncedCount, errors: errorCount }
}

export async function syncForm(formId: string): Promise<{ synced: number; errors: number }> {
  const unsynced = await getUnsyncedResponsesByForm(formId)
  return syncBatchForForm(formId, unsynced)
}
