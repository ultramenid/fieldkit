import type { Field, FieldType } from '@fieldkit/form-schema'

export interface BuilderField extends Field {}

export interface BuilderState {
  formId: string
  title: string
  description: string
  fields: BuilderField[]
  selectedId: string | null
  isDirty: boolean
  isSaving: boolean
  isPublished: boolean
}

export type BuilderAction =
  | { type: 'ADD_FIELD'; fieldType: FieldType }
  | { type: 'SELECT_FIELD'; id: string | null }
  | { type: 'UPDATE_FIELD'; id: string; patch: Partial<BuilderField> }
  | { type: 'REORDER_FIELDS'; fromIndex: number; toIndex: number }
  | { type: 'DELETE_FIELD'; id: string }
  | { type: 'SET_TITLE'; title: string }
  | { type: 'SET_DESCRIPTION'; description: string }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'MARK_CLEAN' }
  | { type: 'SET_PUBLISHED'; isPublished: boolean }

export const DEFAULT_LABELS: Record<FieldType, string> = {
  text: 'Text field',
  email: 'Email address',
  number: 'Number field',
  textarea: 'Long text',
  select: 'Dropdown',
  radio: 'Single choice',
  checkbox: 'Multiple choice',
  date: 'Date',
  file: 'File upload',
  rating: 'Rating',
}

export const DEFAULT_OPTIONS = ['Option 1', 'Option 2', 'Option 3']
