import { FormConfig, SyncResult } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'

const SERVER_URL_KEY = 'fieldkit_server_url'

export async function getServerUrl(): Promise<string> {
  const url = await AsyncStorage.getItem(SERVER_URL_KEY)
  return url ?? ''
}

export async function setServerUrl(url: string): Promise<void> {
  const trimmed = url.replace(/\/+$/, '')
  await AsyncStorage.setItem(SERVER_URL_KEY, trimmed)
}

export async function fetchFormConfig(formId: string, serverUrl?: string): Promise<FormConfig> {
  const base = (serverUrl ?? await getServerUrl()).replace(/\/+$/, '')
  if (!base) throw new Error('Server URL not configured')

  const res = await fetch(`${base}/api/forms/${formId}/export`)
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`)
  return res.json()
}

export async function syncResponses(
  formId: string,
  secret: string,
  responses: { submissionId: string; submittedAt: string; answers: { fieldId: string; value: unknown }[] }[],
  serverUrl?: string
): Promise<SyncResult> {
  const base = (serverUrl ?? await getServerUrl()).replace(/\/+$/, '')
  if (!base) throw new Error('Server URL not configured')

  const res = await fetch(`${base}/api/mobile/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formId, secret, responses }),
  })
  return res.json()
}
