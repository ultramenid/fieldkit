import { z } from 'zod'

export const fieldTypeSchema = z.enum([
  'text',
  'email',
  'number',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'date',
  'file',
  'rating',
])

export const fieldValidationSchema = z.object({
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  maxSelections: z.number().int().min(0).optional(),
  acceptedTypes: z.array(z.string()).optional(),
  maxFileSize: z.number().int().min(0).optional(),
  maxStars: z.number().int().min(1).optional(),
  minDate: z.string().optional(),
  maxDate: z.string().optional(),
})

export const fieldSchema = z.object({
  id: z.string().min(1).max(128),
  type: fieldTypeSchema,
  label: z.string().min(1).max(500),
  placeholder: z.string().max(500).optional(),
  helpText: z.string().max(1000).optional(),
  required: z.boolean(),
  options: z.array(z.string().max(500)).max(200).optional(),
  validation: fieldValidationSchema.optional(),
})

export const formSettingsSchema = z.object({
  submitButtonText: z.string().max(100),
  confirmationMessage: z.string().max(1000),
  allowMultipleSubmissions: z.boolean(),
})

export const formConfigSchema = z.object({
  formId: z.string().min(1).max(128),
  title: z.string().min(1).max(500),
  description: z.string().max(5000),
  version: z.number().int().min(0),
  exportedAt: z.string(),
  fields: z.array(fieldSchema).max(200),
  settings: formSettingsSchema,
})

export const exportedFormConfigSchema = formConfigSchema.extend({
  secret: z.string().min(1),
  _serverUrl: z.string().url(),
})

export type FieldType = z.infer<typeof fieldTypeSchema>
export type FieldValidation = z.infer<typeof fieldValidationSchema>
export type Field = z.infer<typeof fieldSchema>
export type FormSettings = z.infer<typeof formSettingsSchema>
export type FormConfig = z.infer<typeof formConfigSchema>
export type ExportedFormConfig = z.infer<typeof exportedFormConfigSchema>
