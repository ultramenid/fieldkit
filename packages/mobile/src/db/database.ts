import * as SQLite from 'expo-sqlite'
import { FormRecord, ResponseRecord } from '../types'

let db: SQLite.SQLiteDatabase | null = null

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db
  db = await SQLite.openDatabaseAsync('fieldkit.db')
  await db.execAsync(`PRAGMA journal_mode = WAL;`)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS forms (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      config_json TEXT NOT NULL,
      secret TEXT NOT NULL,
      imported_at INTEGER NOT NULL,
      last_synced_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      form_id TEXT NOT NULL,
      submission_id TEXT NOT NULL UNIQUE,
      data_json TEXT NOT NULL,
      submitted_at INTEGER NOT NULL,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (form_id) REFERENCES forms(id)
    );
  `)
  return db
}

export async function upsertForm(form: FormRecord): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    `INSERT OR REPLACE INTO forms (id, title, description, config_json, secret, imported_at, last_synced_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    form.id, form.title, form.description, form.configJson,
    form.secret, form.importedAt, form.lastSyncedAt ?? null
  )
}

export async function getAllForms(): Promise<FormRecord[]> {
  const d = await getDatabase()
  return d.getAllAsync<FormRecord>(
    `SELECT id, title, description, config_json as configJson, secret, imported_at as importedAt, last_synced_at as lastSyncedAt
     FROM forms ORDER BY imported_at DESC`
  )
}

export async function getResponseCountsByForm(): Promise<Record<string, number>> {
  const d = await getDatabase()
  const rows = await d.getAllAsync<{ form_id: string; total: number }>(
    'SELECT form_id, COUNT(*) as total FROM responses GROUP BY form_id'
  )

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.form_id] = row.total
    return acc
  }, {})
}

export async function getUnsyncedCountsByForm(): Promise<Record<string, number>> {
  const d = await getDatabase()
  const rows = await d.getAllAsync<{ form_id: string; total: number }>(
    'SELECT form_id, COUNT(*) as total FROM responses WHERE synced = 0 GROUP BY form_id'
  )

  return rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.form_id] = row.total
    return acc
  }, {})
}

export async function getUnsyncedResponsesByForm(formId: string): Promise<ResponseRecord[]> {
  const d = await getDatabase()
  return d.getAllAsync<ResponseRecord>(
    `SELECT id, form_id as formId, submission_id as submissionId, data_json as dataJson, submitted_at as submittedAt, synced
     FROM responses WHERE synced = 0 AND form_id = ? ORDER BY submitted_at ASC`,
    formId
  )
}

export async function deleteFormAndResponses(formId: string): Promise<void> {
  const d = await getDatabase()
  await d.runAsync('DELETE FROM responses WHERE form_id = ?', formId)
  await d.runAsync('DELETE FROM forms WHERE id = ?', formId)
}

export async function getForm(id: string): Promise<FormRecord | null> {
  const d = await getDatabase()
  return d.getFirstAsync<FormRecord>(
    `SELECT id, title, description, config_json as configJson, secret, imported_at as importedAt, last_synced_at as lastSyncedAt
     FROM forms WHERE id = ?`, id
  ) ?? null
}

export async function insertResponse(
  id: string,
  formId: string,
  submissionId: string,
  dataJson: string,
  submittedAt: number
): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    `INSERT INTO responses (id, form_id, submission_id, data_json, submitted_at, synced)
     VALUES (?, ?, ?, ?, ?, 0)`,
    id, formId, submissionId, dataJson, submittedAt
  )
}

export async function getUnsyncedResponses(): Promise<ResponseRecord[]> {
  const d = await getDatabase()
  return d.getAllAsync<ResponseRecord>(
    `SELECT id, form_id as formId, submission_id as submissionId, data_json as dataJson, submitted_at as submittedAt, synced
     FROM responses WHERE synced = 0 ORDER BY submitted_at ASC`
  )
}

export async function markResponsesSynced(ids: string[]): Promise<void> {
  const d = await getDatabase()
  const placeholders = ids.map(() => '?').join(',')
  await d.runAsync(
    `UPDATE responses SET synced = 1 WHERE id IN (${placeholders})`,
    ...ids
  )
}

export async function updateResponseData(id: string, dataJson: string): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    'UPDATE responses SET data_json = ? WHERE id = ?',
    dataJson, id
  )
}

export async function updateFormLastSynced(formId: string, timestamp: number): Promise<void> {
  const d = await getDatabase()
  await d.runAsync(
    'UPDATE forms SET last_synced_at = ? WHERE id = ?',
    timestamp, formId
  )
}

export async function deleteAllData(): Promise<void> {
  const d = await getDatabase()
  await d.runAsync('DELETE FROM responses')
  await d.runAsync('DELETE FROM forms')
}
