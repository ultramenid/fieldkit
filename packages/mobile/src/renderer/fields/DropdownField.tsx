import { useState } from 'react'
import { TouchableOpacity, Text, StyleSheet, View, Modal, FlatList } from 'react-native'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function DropdownField({ field, value, error, onChange, onBlur }: Props) {
  const [open, setOpen] = useState(false)
  const options = field.options ?? []

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <TouchableOpacity
        style={[styles.trigger, error ? styles.triggerError : null]}
        onPress={() => setOpen(true)}
      >
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || field.placeholder || 'Select...'}
        </Text>
        <Text style={styles.arrow}>{'    ▼'}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => { setOpen(false); onBlur() }}>
        <TouchableOpacity style={styles.backdrop} onPress={() => { setOpen(false); onBlur() }}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>{field.label}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.option, item === value && styles.optionSelected]}
                  onPress={() => { onChange(item); setOpen(false); onBlur() }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12, minHeight: 48,
  },
  triggerError: { borderColor: '#dc2626' },
  triggerText: { fontSize: 15, color: '#000', flex: 1 },
  triggerPlaceholder: { fontSize: 15, color: '#a3a3a3', flex: 1 },
  arrow: { fontSize: 12, color: '#737373' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16,
    maxHeight: '60%', paddingTop: 20, paddingBottom: 40,
  },
  sheetTitle: { fontSize: 17, fontWeight: '600', color: '#000', textAlign: 'center', marginBottom: 16 },
  option: {
    paddingVertical: 14, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  optionSelected: { backgroundColor: '#fafafa' },
  optionText: { fontSize: 15, color: '#000' },
  optionTextSelected: { fontWeight: '600' },
})
