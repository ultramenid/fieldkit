export type MobileErrorCode = 'config_fetch_failed' | 'upload_failed' | 'sync_failed'

export const SAFE_MESSAGES: Record<MobileErrorCode, string> = {
  config_fetch_failed: 'Failed to load form config. Please try again.',
  upload_failed: 'File upload failed. Please try again.',
  sync_failed: 'Sync failed. Please try again.',
}

export class MobileApiError extends Error {
  readonly code: MobileErrorCode
  readonly status?: number

  constructor(code: MobileErrorCode, status?: number) {
    super(SAFE_MESSAGES[code])
    this.name = 'MobileApiError'
    this.code = code
    this.status = status
  }
}

export function createMobileApiError(code: MobileErrorCode, status?: number): MobileApiError {
  return new MobileApiError(code, status)
}

export function getSafeErrorMessage(error: unknown, fallback: MobileErrorCode): string {
  if (error instanceof MobileApiError) return error.message
  return SAFE_MESSAGES[fallback]
}
