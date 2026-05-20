import { TouchableOpacity, Text, Image, StyleSheet, View, Alert } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { FieldWrapper } from './FieldWrapper'
import { FieldConfig } from '../../types'

const DEFAULT_MAX_SIZE = 20 * 1024 * 1024

function typesToLabel(types?: string[]): string {
  if (!types || types.length === 0) return 'JPG, PNG, WebP, GIF'
  const map: Record<string, string> = {
    'image/jpeg': 'JPG',
    'image/png': 'PNG',
    'image/webp': 'WebP',
    'image/gif': 'GIF',
    'application/pdf': 'PDF',
  }
  return types.map((t) => map[t] ?? t).join(', ')
}

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
}

export function FileField({ field, value, error, onChange }: Props) {
  const maxSize = field.validation?.maxFileSize ?? DEFAULT_MAX_SIZE
  const maxSizeMB = Math.round((maxSize / (1024 * 1024)) * 10) / 10
  const acceptedTypes = field.validation?.acceptedTypes?.length ? field.validation.acceptedTypes : undefined
  const hintText = typesToLabel(acceptedTypes)

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]

      // Check file size if URI is local
      if (asset.uri) {
        try {
          const info = await FileSystem.getInfoAsync(asset.uri)
          if (info.exists && info.size && info.size > maxSize) {
            Alert.alert('File too large', `Maximum size is ${maxSizeMB}MB`)
            return
          }
        } catch {
          // Silently continue if file info unavailable
        }
      }

      onChange(asset.uri)
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
          <Text style={styles.dropHint}>{hintText} up to {maxSizeMB}MB</Text>
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
