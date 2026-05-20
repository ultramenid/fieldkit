import {
  getUnsyncedResponses,
  getUnsyncedResponsesByForm,
  markResponsesSynced,
  updateFormLastSynced,
  updateResponseData,
  getForm,
} from '../db/database'
import { syncResponses, uploadFile, isFileUri } from '../api/server'
import { ResponseRecord } from '../types'

async function uploadFilesInAnswers(
  answers: { fieldId: string; value: unknown }[],
  formId: string
): Promise<{ answers: { fieldId: string; value: unknown }[]; uploaded: number; errors: string[] }> {
  let uploaded = 0
  const errs: string[] = []

  const updated = await Promise.all(
    answers.map(async (a) => {
      if (!isFileUri(a.value)) return a

      const uri = a.value as string
      console.log('[sync] file detected:', { formId, fieldId: a.fieldId, uriSuffix: uri.slice(-60) })

      try {
        const result = await uploadFile(a.value as string)
        uploaded++
        console.log('[sync] file uploaded OK, replaced with:', result.fileUrl)
        return { ...a, value: result.fileUrl }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        console.error('[sync] file upload FAILED:', msg)
        errs.push(`${a.fieldId}: ${msg}`)
        // Do NOT send local path — server can't use it
        return { ...a, value: null }
      }
    })
  )
  return { answers: updated, uploaded, errors: errs }
}

async function syncBatchForForm(formId: string, responses: ResponseRecord[]): Promise<{ synced: number; errors: number }> {
  if (responses.length === 0) return { synced: 0, errors: 0 }

  const form = await getForm(formId)
  if (!form) {
    console.error('[sync] form not found:', formId)
    return { synced: 0, errors: responses.length }
  }

  const batch = responses.slice(0, 20)

  try {
    // Step 1: Upload any files and replace local URIs with server URLs
    let totalUploaded = 0
    const uploadErrors: string[] = []

    const processed = await Promise.all(
      batch.map(async (r) => {
        const data = JSON.parse(r.dataJson)
        const { answers, uploaded, errors } = await uploadFilesInAnswers(data.answers ?? [], formId)
        totalUploaded += uploaded
        uploadErrors.push(...errors)

        if (uploaded > 0 || errors.length > 0) {
          const newData = { ...data, answers }
          await updateResponseData(r.id, JSON.stringify(newData))
        }
        return {
          submissionId: r.submissionId,
          submittedAt: new Date(r.submittedAt).toISOString(),
          answers,
        }
      })
    )

    if (uploadErrors.length > 0) {
      console.warn('[sync] some uploads failed, those file values set to null:', uploadErrors)
    }
    if (totalUploaded > 0) {
      console.log('[sync] total files uploaded:', totalUploaded)
    }

    // Step 2: Sync to server
    console.log('[sync] posting to server:', { formId, payloadCount: processed.length, secret: form.secret?.slice(0, 4) + '…' })
    const result = await syncResponses(formId, form.secret, processed)
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
