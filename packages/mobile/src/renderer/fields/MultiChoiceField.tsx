import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string[]
  error?: string
  onChange: (val: string[]) => void
  onBlur: () => void
}

export function MultiChoiceField({ field, value, error, onChange }: Props) {
  const toggle = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt))
    } else {
      const max = field.validation?.maxSelections
      if (max && value.length >= max) return
      onChange([...value, opt])
    }
  }

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <Text style={styles.hint}>
        {field.validation?.maxSelections ? `Select up to ${field.validation.maxSelections}` : 'Select all that apply'}
      </Text>
      <View style={styles.list}>
        {(field.options ?? []).map((opt) => {
          const selected = value.includes(opt)
          return (
            <TouchableOpacity
              key={opt}
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => toggle(opt)}
            >
              <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                {selected && <Text style={styles.checkmark}>{'✓'}</Text>}
              </View>
              <Text style={styles.rowText}>{opt}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, color: '#a3a3a3', marginBottom: 8 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  rowSelected: { borderColor: '#000' },
  checkbox: {
    width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxSelected: { borderColor: '#000', backgroundColor: '#000' },
  checkmark: { fontSize: 12, color: '#fff', fontWeight: '700' },
  rowText: { fontSize: 15, color: '#000', flex: 1 },
})
