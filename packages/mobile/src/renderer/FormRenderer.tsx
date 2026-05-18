import { useState, useCallback } from 'react'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { TextField } from './fields/TextField'
import { EmailField } from './fields/EmailField'
import { NumberField } from './fields/NumberField'
import { LongTextField } from './fields/LongTextField'
import { DropdownField } from './fields/DropdownField'
import { SingleChoiceField } from './fields/SingleChoiceField'
import { MultiChoiceField } from './fields/MultiChoiceField'
import { DateField } from './fields/DateField'
import { FileField } from './fields/FileField'
import { RatingField } from './fields/RatingField'
import { ProgressBar } from './ProgressBar'
import { Description } from './Description'
import { FieldConfig, FormConfig } from '../types'

interface Props {
  config: FormConfig
  onSubmit: (answers: { fieldId: string; value: unknown }[]) => void
}

type FieldValue = string | string[] | number

export function FormRenderer({ config, onSubmit }: Props) {
  const [values, setValues] = useState<Record<string, FieldValue>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleChange = useCallback((fieldId: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleBlur = useCallback((fieldId: string) => {
    setTouched((prev) => ({ ...prev, [fieldId]: true }))
    const field = config.fields.find((f) => f.id === fieldId)
    if (field) {
      const err = validateField(field, values[fieldId] ?? '')
      setErrors((prev) => {
        const next = { ...prev }
        if (err) next[fieldId] = err
        else delete next[fieldId]
        return next
      })
    }
  }, [config.fields, values])

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {}
    for (const field of config.fields) {
      const err = validateField(field, values[field.id] ?? '')
      if (err) newErrors[field.id] = err
    }
    setErrors(newErrors)
    setTouched(() => {
      const all: Record<string, boolean> = {}
      config.fields.forEach((f) => { all[f.id] = true })
      return all
    })
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateAll()) return

    const answers = config.fields.map((f) => ({
      fieldId: f.id,
      value: values[f.id] ?? '',
    }))
    onSubmit(answers)
  }

  const completed = config.fields.filter((f) => {
    const v = values[f.id]
    if (v === undefined || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  }).length

  const renderField = (field: FieldConfig) => {
    const props = {
      field,
      value: values[field.id] ?? (field.type === 'checkbox' ? [] : field.type === 'rating' ? 0 : ''),
      error: touched[field.id] ? errors[field.id] : undefined,
      onChange: (val: FieldValue) => handleChange(field.id, val),
      onBlur: () => handleBlur(field.id),
      key: field.id,
    }

    switch (field.type) {
      case 'text': return <TextField {...props} value={values[field.id] as string ?? ''} />
      case 'email': return <EmailField {...props} value={values[field.id] as string ?? ''} />
      case 'number': return <NumberField {...props} value={values[field.id] as string ?? ''} />
      case 'textarea': return <LongTextField {...props} value={values[field.id] as string ?? ''} />
      case 'select': return <DropdownField {...props} value={values[field.id] as string ?? ''} />
      case 'radio': return <SingleChoiceField {...props} value={values[field.id] as string ?? ''} />
      case 'checkbox': return <MultiChoiceField {...props} value={values[field.id] as string[] ?? []} onChange={(val: string[]) => handleChange(field.id, val)} />
      case 'date': return <DateField {...props} value={values[field.id] as string ?? ''} />
      case 'file': return <FileField {...props} value={values[field.id] as string ?? ''} />
      case 'rating': return <RatingField {...props} value={values[field.id] as number ?? 0} onChange={(val: number) => handleChange(field.id, val)} />
      default: return null
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{config.title}</Text>
      <Description html={config.description} />
      {config.fields.map(renderField)}
      <View style={styles.progressWrap}>
        <ProgressBar completed={completed} total={config.fields.length} />
        <Text style={styles.progressText}>{completed}/{config.fields.length}</Text>
      </View>
      <TouchableOpacity style={styles.submit} onPress={handleSubmit}>
        <Text style={styles.submitText}>
          {config.settings?.submitButtonText ?? 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

function validateField(field: FieldConfig, value: FieldValue): string | null {
  if (field.required) {
    if (value === '' || value === undefined || value === null) return 'This field is required'
    if (Array.isArray(value) && value.length === 0) return 'This field is required'
    if (typeof value === 'number' && value === 0) return 'This field is required'
  }

  if (typeof value === 'string' && value !== '') {
    if (field.validation?.minLength && value.length < field.validation.minLength) {
      return `Minimum ${field.validation.minLength} characters`
    }
    if (field.validation?.maxLength && value.length > field.validation.maxLength) {
      return `Maximum ${field.validation.maxLength} characters`
    }
    if (field.validation?.pattern) {
      try {
        if (!new RegExp(field.validation.pattern).test(value)) {
          return 'Invalid format'
        }
      } catch {}
    }
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Invalid email address'
    }
    if (field.type === 'number') {
      const n = parseFloat(value)
      if (isNaN(n)) return 'Must be a number'
      if (field.validation?.min !== undefined && n < field.validation.min) {
        return `Minimum value: ${field.validation.min}`
      }
      if (field.validation?.max !== undefined && n > field.validation.max) {
        return `Maximum value: ${field.validation.max}`
      }
    }
  }

  return null
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: '#000', marginBottom: 8 },
  progressWrap: {
    marginTop: 8, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  progressText: {
    fontSize: 12, color: '#737373', fontFamily: 'monospace',
  },
  submit: {
    backgroundColor: '#000', borderRadius: 9999,
    paddingVertical: 16, alignItems: 'center',
  },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
})
