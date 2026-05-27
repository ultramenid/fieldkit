import { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useFocusEffect } from 'expo-router'
import { getForm, getResponsesByForm } from '../../../src/db/database'
import { RichTextDisplay } from '../../../src/components/RichTextDisplay'
import { formatAnswerPlain, formatAnswerTableCell } from '../../../src/lib/response-answer-display'
import { FormConfig, FieldConfig, ResponseRecord } from '../../../src/types'
import { TOKENS } from '../../../src/theme/tokens'

interface ParsedResponse {
  record: ResponseRecord
  answers: { fieldId: string; value: unknown }[]
}

function parseResponse(record: ResponseRecord): ParsedResponse {
  let answers: { fieldId: string; value: unknown }[] = []
  try {
    const data = JSON.parse(record.dataJson) as { answers?: unknown }
    const raw = data?.answers
    if (Array.isArray(raw)) {
      answers = raw as { fieldId: string; value: unknown }[]
    } else if (raw && typeof raw === 'object' && Array.isArray((raw as { answers?: unknown }).answers)) {
      answers = (raw as { answers: { fieldId: string; value: unknown }[] }).answers
    }
  } catch {
    // ignore malformed
  }
  return { record, answers }
}

export default function FormResponsesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [responses, setResponses] = useState<ParsedResponse[]>([])
  const [selected, setSelected] = useState<ParsedResponse | null>(null)

  const load = useCallback(async () => {
    if (!id) return
    const [form, rows] = await Promise.all([getForm(id), getResponsesByForm(id)])
    if (form) {
      setTitle(form.title)
      try {
        const config = JSON.parse(form.configJson) as FormConfig
        setFields(config.fields ?? [])
      } catch {
        setFields([])
      }
    }
    setResponses(rows.map(parseResponse))
  }, [id])

  useFocusEffect(
    useCallback(() => {
      load()
    }, [load]),
  )

  const formatSubmitted = (ts: number) =>
    new Date(ts).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>{title || 'Responses'}</Text>
      <Text style={styles.subtitle}>
        {responses.length} response{responses.length === 1 ? '' : 's'}
      </Text>

      {responses.length === 0 ? (
        <Text style={styles.empty}>No responses stored on this device yet.</Text>
      ) : (
        <FlatList
          data={responses}
          keyExtractor={(item) => item.record.id}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.7}
              onPress={() => setSelected(item)}
            >
              <Text style={styles.rowNum}>{responses.length - index}</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowPreview} numberOfLines={2}>
                  {fields.length > 0
                    ? formatAnswerTableCell(
                        fields[0].type,
                        item.answers.find((a) => a.fieldId === fields[0].id)?.value,
                      )
                    : formatSubmitted(item.record.submittedAt)}
                </Text>
                <Text style={styles.rowTime}>{formatSubmitted(item.record.submittedAt)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <Modal
        visible={selected !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.overlay} onPress={() => setSelected(null)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderText}>
              <Text style={styles.sheetTitle}>Response</Text>
              {selected && (
                <Text style={styles.sheetSubtitle}>
                  {formatSubmitted(selected.record.submittedAt)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setSelected(null)}
              accessibilityLabel="Close"
            >
              <Text style={styles.closeBtnText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.sheetScroll} contentContainerStyle={styles.sheetContent}>
            {selected &&
              fields.map((f) => {
                const answer = selected.answers.find((a) => a.fieldId === f.id)
                const value = answer?.value
                const isRich = f.type === 'richtext' && typeof value === 'string' && value.trim()
                return (
                  <View key={f.id} style={styles.fieldCard}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    {isRich ? (
                      <RichTextDisplay html={value} color={TOKENS.colors.black} fontSize={14} />
                    ) : (
                      <Text style={styles.fieldValue}>
                        {formatAnswerPlain(f.type, value)}
                      </Text>
                    )}
                  </View>
                )
              })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  pageTitle: {
    fontSize: 22,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.black,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  subtitle: {
    fontSize: TOKENS.fontSize.small,
    color: TOKENS.colors.gray500,
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontFamily: 'monospace',
  },
  empty: {
    textAlign: 'center',
    color: TOKENS.colors.gray500,
    fontSize: TOKENS.fontSize.body,
    padding: 40,
  },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.colors.gray200,
  },
  rowNum: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: TOKENS.colors.gray500,
    width: 24,
  },
  rowBody: { flex: 1 },
  rowPreview: { fontSize: 14, color: TOKENS.colors.black },
  rowTime: {
    fontSize: 12,
    color: TOKENS.colors.gray500,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '85%',
    backgroundColor: TOKENS.colors.white,
    borderTopWidth: 1,
    borderTopColor: TOKENS.colors.gray200,
    borderTopLeftRadius: TOKENS.radius.container,
    borderTopRightRadius: TOKENS.radius.container,
    paddingTop: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sheetHeaderText: { flex: 1 },
  sheetTitle: {
    fontSize: 18,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.black,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: TOKENS.colors.gray500,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: TOKENS.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 20, color: TOKENS.colors.gray500, lineHeight: 22 },
  sheetScroll: { flex: 1 },
  sheetContent: { paddingHorizontal: 20, paddingBottom: 32 },
  fieldCard: {
    borderWidth: 1,
    borderColor: TOKENS.colors.gray200,
    borderRadius: TOKENS.radius.container,
    padding: 14,
    marginBottom: 10,
  },
  fieldLabel: {
    fontFamily: 'monospace',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: TOKENS.colors.gray500,
    marginBottom: 6,
  },
  fieldValue: { fontSize: 14, color: TOKENS.colors.black, lineHeight: 22 },
})
