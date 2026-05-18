import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FormRenderer } from '../../src/renderer/FormRenderer'
import { getForm, insertResponse } from '../../src/db/database'
import { FormConfig } from '../../src/types'

export default function FormFillScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [config, setConfig] = useState<FormConfig | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [confirmMsg, setConfirmMsg] = useState('')
  const [allowMultiple, setAllowMultiple] = useState(false)

  useEffect(() => {
    if (!id) return
    getForm(id).then((form) => {
      if (!form) {
        Alert.alert('Error', 'Form not found')
        router.back()
        return
      }
      const parsed = JSON.parse(form.configJson) as FormConfig
      setConfig(parsed)
      setConfirmMsg(parsed.settings?.confirmationMessage ?? 'Thank you for your response.')
      setAllowMultiple(parsed.settings?.allowMultipleSubmissions ?? false)
    })
  }, [id])

  const handleSubmit = async (answers: { fieldId: string; value: unknown }[]) => {
    if (!config) return

    const submissionId = generateId()
    const now = Date.now()

    await insertResponse(
      generateId(),
      config.formId,
      submissionId,
      JSON.stringify({ answers, source: 'mobile' }),
      now
    )

    setSubmitted(true)
  }

  const resetForm = () => setSubmitted(false)

  if (!config) return <View style={styles.container} />

  if (submitted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.checkIcon}>{'✓'}</Text>
        <Text style={styles.confirmTitle}>Response submitted</Text>
        <Text style={styles.confirmMsg}>{confirmMsg}</Text>
        {allowMultiple && (
          <TouchableOpacity style={styles.submitBtn} onPress={resetForm}>
            <Text style={styles.submitText}>Submit another response</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Back to forms</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FormRenderer config={config} onSubmit={handleSubmit} />
    </View>
  )
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 40,
  },
  checkIcon: {
    fontSize: 48, color: '#22c55e', marginBottom: 16,
    width: 64, height: 64, lineHeight: 64, textAlign: 'center',
    borderWidth: 2, borderColor: '#22c55e', borderRadius: 32,
    overflow: 'hidden',
  },
  confirmTitle: { fontSize: 22, fontWeight: '600', color: '#000', marginBottom: 8 },
  confirmMsg: { fontSize: 15, color: '#737373', marginBottom: 24, textAlign: 'center' },
  submitBtn: {
    backgroundColor: '#000', borderRadius: 9999, paddingVertical: 14, paddingHorizontal: 28,
    marginBottom: 12,
  },
  submitText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  backBtn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 14, paddingHorizontal: 28,
  },
  backText: { fontSize: 14, fontWeight: '500', color: '#000' },
})
