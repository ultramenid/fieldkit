import { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function DateField({ field, value, error, onChange }: Props) {
  const [show, setShow] = useState(false)

  const minDate = field.validation?.minDate ? new Date(field.validation.minDate) : undefined
  const maxDate = field.validation?.maxDate ? new Date(field.validation.maxDate) : undefined

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setShow(true)}
      >
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || 'Select date...'}
        </Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          minimumDate={minDate}
          maximumDate={maxDate}
          onChange={(_e, d) => {
            setShow(false)
            if (d) onChange(d.toISOString().split('T')[0])
          }}
        />
      )}
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
    justifyContent: 'center',
  },
  triggerError: { borderColor: '#dc2626' },
  triggerText: { fontSize: 15, color: '#000' },
  triggerPlaceholder: { fontSize: 15, color: '#a3a3a3' },
})
