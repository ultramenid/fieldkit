import { TouchableOpacity, Text, Image, StyleSheet, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function FileField({ field, value, error, onChange }: Props) {
  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0].uri)
    }
  }

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      {value ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: value }} style={styles.preview} />
          <TouchableOpacity onPress={pick} style={styles.changeBtn}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.dropZone} onPress={pick}>
          <Text style={styles.dropText}>Tap to select image</Text>
          <Text style={styles.dropHint}>JPG, PNG, WebP, GIF up to 10MB</Text>
        </TouchableOpacity>
      )}
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  dropZone: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingVertical: 32, alignItems: 'center', borderStyle: 'dashed',
  },
  dropText: { fontSize: 14, color: '#737373', marginBottom: 4 },
  dropHint: { fontSize: 12, color: '#a3a3a3' },
  previewWrap: { gap: 8 },
  preview: {
    width: '100%', height: 160, borderRadius: 12,
    borderWidth: 1, borderColor: '#e5e5e5',
  },
  changeBtn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 8, alignItems: 'center',
  },
  changeText: { fontSize: 13, color: '#000', fontWeight: '500' },
})
