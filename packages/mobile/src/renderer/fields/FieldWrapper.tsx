import { View, Text, StyleSheet } from 'react-native'
import { ReactNode } from 'react'

interface FieldWrapperProps {
  label: string
  helpText?: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FieldWrapper({ label, helpText, error, required, children }: FieldWrapperProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}{required ? ' *' : ''}
      </Text>
      {children}
      {helpText && !error ? <Text style={styles.help}>{helpText}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 15, fontWeight: '500', color: '#000', marginBottom: 6 },
  help: { fontSize: 13, color: '#737373', marginTop: 4 },
  error: { fontSize: 13, color: '#dc2626', marginTop: 4 },
})
