export interface FieldValidation {
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: number
  max?: number
  maxSelections?: number
  minDate?: string
  maxDate?: string
  acceptedTypes?: string[]
  maxFileSize?: number
  maxStars?: number
}

export interface FieldConfig {
  id: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' |
        'radio' | 'checkbox' | 'date' | 'file' | 'rating' | 'richtext'
  label: string
  placeholder?: string
  helpText?: string
  content?: string
  editorFeatures?: Record<string, boolean>
  required: boolean
  options?: string[]
  validation?: FieldValidation
}

export interface FormSettings {
  submitButtonText?: string
  confirmationMessage?: string
  allowMultipleSubmissions?: boolean
}

export interface FormConfig {
  formId: string
  title: string
  description: string
  fields: FieldConfig[]
  settings: FormSettings
  version: number
  secret: string
  exportedAt: string
  _serverUrl?: string
}

export interface FormRecord {
  id: string
  title: string
  description: string
  configJson: string
  secret: string
  importedAt: number
  lastSyncedAt: number | null
}

export interface ResponseAnswer {
  fieldId: string
  value: unknown
}

export interface ResponseRecord {
  id: string
  formId: string
  submissionId: string
  dataJson: string
  submittedAt: number
  synced: 0 | 1
}

export interface SyncResult {
  ok: boolean
  imported?: number
  duplicates?: number
  error?: string
}
