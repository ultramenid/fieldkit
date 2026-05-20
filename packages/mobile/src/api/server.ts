import { FormConfig, SyncResult } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'

const SERVER_URL_KEY = 'fieldkit_server_url'

function normalizeUrl(raw: string): string {
  return raw.trim().replace(/\/+$/, '')
}

function isIpv4Host(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
}

function isIpHost(hostname: string): boolean {
  if (isIpv4Host(hostname)) return true
  return hostname.includes(':')
}

function isLoopbackHost(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  return lower === 'localhost' || lower === '::1' || lower === '[::1]' || lower === '0.0.0.0' || lower.startsWith('127.')
}

function validateServerUrl(raw: string): string {
  const base = normalizeUrl(raw)
  if (!base) throw new Error('Server URL not configured')

  let parsed: URL
  try {
    parsed = new URL(base)
  } catch {
    throw new Error('Invalid server URL')
  }

  const protocol = parsed.protocol.toLowerCase()
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('Server URL must start with http:// or https://')
  }

  const hostname = parsed.hostname.toLowerCase()

  if (__DEV__) {
    if (isLoopbackHost(hostname)) {
      throw new Error('Use LAN IP or domain (localhost is not reachable from mobile app)')
    }
    return base
  }

  if (protocol !== 'https:') {
    throw new Error('Production server URL must use https://')
  }

  if (isLoopbackHost(hostname) || isIpHost(hostname)) {
    throw new Error('Production server URL must be an HTTPS domain')
  }

  return base
}

export async function getServerUrl(): Promise<string> {
  const url = await AsyncStorage.getItem(SERVER_URL_KEY)
  return url ?? ''
}

export async function setServerUrl(url: string): Promise<void> {
  const validated = validateServerUrl(url)
  await AsyncStorage.setItem(SERVER_URL_KEY, validated)
}

export async function fetchFormConfig(formId: string, serverUrl?: string): Promise<FormConfig> {
  const base = validateServerUrl(serverUrl ?? await getServerUrl())

  const res = await fetch(`${base}/api/forms/${formId}/export`)
  if (!res.ok) throw new Error(`Config fetch failed: ${res.status}`)
  return res.json()
}

const FILE_URI_RE = /^(file:\/\/|\/var\/|\/private\/|\/tmp\/|\/storage\/|content:\/\/)/i

export function isFileUri(value: unknown): value is string {
  return typeof value === 'string' && FILE_URI_RE.test(value)
}

interface UploadResult {
  fileUrl: string
  key: string
  size: number
}

/**
 * Upload a local file to the server's MinIO storage.
 * Returns the public fileUrl which replaces the local URI in response data.
 */
export async function uploadFile(
  localUri: string,
  serverUrl?: string
): Promise<UploadResult> {
  const base = validateServerUrl(serverUrl ?? await getServerUrl())

  // Check file exists
  const info = await FileSystem.getInfoAsync(localUri)
  if (!info.exists) {
    throw new Error('File not found: ' + localUri)
  }

  const filename = localUri.split('/').pop() ?? 'upload.jpg'

  // Use FileSystem.uploadAsync which handles multipart properly on both platforms
  const result = await FileSystem.uploadAsync(`${base}/api/mobile/upload`, localUri, {
    httpMethod: 'POST',
    fieldName: 'file',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    parameters: { filename },
  })

  if (result.status < 200 || result.status >= 300) {
    throw new Error(`Upload failed: ${result.status} ${result.body}`)
  }

  const json = JSON.parse(result.body)
  return json as UploadResult
}

export async function syncResponses(
  formId: string,
  secret: string,
  responses: { submissionId: string; submittedAt: string; answers: { fieldId: string; value: unknown }[] }[],
  serverUrl?: string
): Promise<SyncResult> {
  const base = validateServerUrl(serverUrl ?? await getServerUrl())

  const res = await fetch(`${base}/api/mobile/responses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formId, secret, responses }),
  })

  const json = await res.json()
  if (!res.ok) {
    throw new Error(`Sync failed: ${res.status} ${JSON.stringify(json)}`)
  }

  return json as SyncResult
}

