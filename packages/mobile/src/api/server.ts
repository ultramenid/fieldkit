import { exportedFormConfigSchema } from '@fieldkit/form-schema'
import { FormConfig, SyncResult } from '../types'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as FileSystem from 'expo-file-system/legacy'
import { createMobileApiError } from './errors'

const SERVER_URL_KEY = 'fieldkit_server_url'
const LOG_PREVIEW_LIMIT = 500

function logPreview(value: string): string {
  return value.length > LOG_PREVIEW_LIMIT ? `${value.slice(0, LOG_PREVIEW_LIMIT)}…` : value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object'
}

function parseUploadResult(value: unknown): UploadResult {
  if (
    !isRecord(value) ||
    typeof value.fileUrl !== 'string' ||
    typeof value.key !== 'string' ||
    typeof value.size !== 'number' ||
    !Number.isFinite(value.size)
  ) {
    throw createMobileApiError('upload_failed')
  }

  return { fileUrl: value.fileUrl, key: value.key, size: value.size }
}

function parseSyncResult(value: unknown): SyncResult {
  if (!isRecord(value) || typeof value.ok !== 'boolean') {
    throw createMobileApiError('sync_failed')
  }
  if ('imported' in value && (typeof value.imported !== 'number' || !Number.isFinite(value.imported))) {
    throw createMobileApiError('sync_failed')
  }
  if ('duplicates' in value && (typeof value.duplicates !== 'number' || !Number.isFinite(value.duplicates))) {
    throw createMobileApiError('sync_failed')
  }
  if ('error' in value && typeof value.error !== 'string') {
    throw createMobileApiError('sync_failed')
  }

  return {
    ok: value.ok,
    imported: typeof value.imported === 'number' ? value.imported : undefined,
    duplicates: typeof value.duplicates === 'number' ? value.duplicates : undefined,
    error: typeof value.error === 'string' ? value.error : undefined,
  }
}

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
  let json: unknown
  try {
    json = await res.json()
  } catch (error) {
    console.error('[mobile-api] config response JSON parse failed:', error)
    throw createMobileApiError('config_fetch_failed', res.status)
  }

  if (!res.ok) {
    console.error('[mobile-api] config fetch failed with status/body:', res.status, json)
    throw createMobileApiError('config_fetch_failed', res.status)
  }

  const parsed = exportedFormConfigSchema.safeParse(json)
  if (!parsed.success) {
    console.error('[mobile-api] config response validation failed:', parsed.error.issues)
    throw createMobileApiError('config_fetch_failed', res.status)
  }

  return parsed.data
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
    console.error('[mobile-api] upload file not found:', localUri)
    throw createMobileApiError('upload_failed')
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
    console.error('[mobile-api] upload failed with status/body:', result.status, logPreview(result.body))
    throw createMobileApiError('upload_failed', result.status)
  }

  let json: unknown
  try {
    json = JSON.parse(result.body)
  } catch (error) {
    console.error('[mobile-api] upload response JSON parse failed:', error)
    throw createMobileApiError('upload_failed', result.status)
  }
  return parseUploadResult(json)
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

  let json: unknown
  try {
    json = await res.json()
  } catch (error) {
    console.error('[mobile-api] sync response JSON parse failed:', error)
    throw createMobileApiError('sync_failed', res.status)
  }

  if (!res.ok) {
    console.error('[mobile-api] sync failed with status/body:', res.status, json)
    throw createMobileApiError('sync_failed', res.status)
  }

  return parseSyncResult(json)
}

