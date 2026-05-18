import { TextInput, StyleSheet } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function TextField({ field, value, error, onChange, onBlur }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        placeholder={field.placeholder}
        placeholderTextColor="#a3a3a3"
        maxLength={field.validation?.maxLength}
      />
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#000', minHeight: 48,
  },
  inputError: { borderColor: '#dc2626' },
})
