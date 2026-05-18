import { getUnsyncedResponses, markResponsesSynced, updateFormLastSynced, getForm } from '../db/database'
import { syncResponses } from '../api/server'
import { ResponseRecord } from '../types'

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
    const form = await getForm(formId)
    if (!form) {
      errorCount += responses.length
      continue
    }

    const batch = responses.slice(0, 20)
    try {
      const parsed = batch.map((r) => JSON.parse(r.dataJson))
      const result = await syncResponses(formId, form.secret, parsed)

      if (result.ok) {
        await markResponsesSynced(batch.map((r) => r.id))
        await updateFormLastSynced(formId, Date.now())
        syncedCount += batch.length
      } else {
        errorCount += batch.length
      }
    } catch {
      errorCount += batch.length
    }
  }

  return { synced: syncedCount, errors: errorCount }
}
