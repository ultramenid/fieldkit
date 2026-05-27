import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { FormRenderer } from '../../../src/renderer/FormRenderer'
import { getForm, insertResponse } from '../../../src/db/database'
import { FormConfig } from '../../../src/types'
import { TOKENS } from '../../../src/theme/tokens'

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
  }, [id, router])

  const handleSubmit = async (answers: { fieldId: string; value: unknown }[]) => {
    if (!config) return

    const submissionId = generateId()
    const now = Date.now()

    await insertResponse(
      generateId(),
      config.formId,
      submissionId,
      JSON.stringify({ answers, source: 'mobile' }),
      now,
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
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: TOKENS.colors.white,
    padding: 40,
  },
  checkIcon: {
    fontSize: 48,
    color: TOKENS.colors.green500,
    marginBottom: 16,
    width: 64,
    height: 64,
    lineHeight: 64,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: TOKENS.colors.green500,
    borderRadius: 32,
    overflow: 'hidden',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.black,
    marginBottom: 8,
  },
  confirmMsg: {
    fontSize: TOKENS.fontSize.body,
    color: TOKENS.colors.gray500,
    marginBottom: 24,
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: TOKENS.colors.black,
    borderRadius: TOKENS.radius.pill,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginBottom: 12,
  },
  submitText: {
    fontSize: TOKENS.fontSize.body,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.white,
  },
  backBtn: {
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  backText: {
    fontSize: TOKENS.fontSize.body,
    fontWeight: TOKENS.type.weightMedium,
    color: TOKENS.colors.black,
  },
})
