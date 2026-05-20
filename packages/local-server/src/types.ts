export type FieldType =
  | 'text'
  | 'email'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'file'
  | 'rating'

export interface FieldValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  maxSelections?: number
  acceptedTypes?: string[]
  maxFileSize?: number
  maxStars?: number
  minDate?: string
  maxDate?: string
}

export interface Field {
  id: string
  type: FieldType
  label: string
  placeholder?: string
  helpText?: string
  required: boolean
  options?: string[]
  validation?: FieldValidation
}

export interface FormSettings {
  submitButtonText: string
  confirmationMessage: string
  allowMultipleSubmissions: boolean
}

export interface FormConfig {
  formId: string
  title: string
  description: string
  version: number
  exportedAt: string
  fields: Field[]
  settings: FormSettings
}
