import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function SingleChoiceField({ field, value, error, onChange }: Props) {
  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <View style={styles.list}>
        {(field.options ?? []).map((opt) => (
          <TouchableOpacity
            key={opt}
            style={[styles.row, value === opt && styles.rowSelected]}
            onPress={() => onChange(value === opt ? '' : opt)}
          >
            <View style={[styles.radio, value === opt && styles.radioSelected]}>
              {value === opt && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.rowText}>{opt}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  rowSelected: { borderColor: '#000' },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: '#000' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#000' },
  rowText: { fontSize: 15, color: '#000', flex: 1 },
})
