import { TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: number
  error?: string
  onChange: (val: number) => void
  onBlur: () => void
}

export function RatingField({ field, value, error, onChange }: Props) {
  const max = field.validation?.max ?? 5

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <View style={styles.row}>
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <TouchableOpacity key={star} onPress={() => onChange(star)}>
            <Text style={[styles.star, star <= value ? styles.starFilled : styles.starEmpty]}>
              {'★'}
            </Text>
          </TouchableOpacity>
        ))}
        {value > 0 && <Text style={styles.count}>{value}/{max}</Text>}
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  star: { fontSize: 28 },
  starFilled: { color: '#000' },
  starEmpty: { color: '#e5e5e5' },
  count: { fontSize: 14, color: '#737373', marginLeft: 8 },
})
