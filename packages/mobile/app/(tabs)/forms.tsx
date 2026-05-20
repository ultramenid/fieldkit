import { useCallback, useState, useRef } from 'react'
import {
  View, FlatList, StyleSheet, RefreshControl,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useStore } from '../../src/store'
import {
  getAllForms,
  getResponseCountsByForm,
  getUnsyncedCountsByForm,
  deleteFormAndResponses,
} from '../../src/db/database'
import { syncAll, syncForm } from '../../src/sync/engine'
import { FormRecord } from '../../src/types'
import { ScreenHeader } from '../../components/ScreenHeader'
import { SyncBar } from '../../components/SyncBar'
import { FormCard } from '../../components/FormCard'
import { EmptyState } from '../../components/EmptyState'
import { TOKENS } from '../../src/theme/tokens'

export default function FormsList() {
  const router = useRouter()
  const forms = useStore((s) => s.forms)
  const setForms = useStore((s) => s.setForms)
  const isOnline = useStore((s) => s.isOnline)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)
  const lastSynced = useStore((s) => s.lastSynced)
  const setLastSynced = useStore((s) => s.setLastSynced)
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({})
  const [unsyncedCounts, setUnsyncedCounts] = useState<Record<string, number>>({})
  const [syncingFormIds, setSyncingFormIds] = useState<Set<string>>(new Set())

  const loadingRef = useRef(false)
  const generationRef = useRef(0)
  const syncFormGuardRef = useRef(false)

  const loadForms = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    const gen = generationRef.current + 1
    generationRef.current = gen
    const [result, counts, pending] = await Promise.all([
      getAllForms(),
      getResponseCountsByForm(),
      getUnsyncedCountsByForm(),
    ])
    if (gen !== generationRef.current) return
    setForms(result)
    setResponseCounts(counts)
    setUnsyncedCounts(pending)
    loadingRef.current = false
  }, [setForms])

  useFocusEffect(
    useCallback(() => {
      loadForms()
    }, [loadForms])
  )

  const handleSync = async () => {
    setSyncing(true)
    try {
      const result = await syncAll()
      setLastSynced(Date.now())
      await loadForms()
    } catch (e) {
      console.error('[sync] all failed:', e)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncForm = async (formId: string) => {
    if (!isOnline || syncFormGuardRef.current || syncingFormIds.has(formId)) return
    syncFormGuardRef.current = true
    setSyncingFormIds((prev) => new Set(prev).add(formId))
    try {
      const result = await syncForm(formId)
      setLastSynced(Date.now())
      await loadForms()
    } catch (e) {
      console.error('[sync] form failed:', formId, e)
    } finally {
      syncFormGuardRef.current = false
      setSyncingFormIds((prev) => {
        const next = new Set(prev)
        next.delete(formId)
        return next
      })
    }
  }

  const handleDeleteForm = (form: FormRecord) => {
    const { Alert } = require('react-native')
    Alert.alert(
      'Delete form',
      `Delete "${form.title}" and all its responses?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteFormAndResponses(form.id)
            await loadForms()
          },
        },
      ]
    )
  }

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never'
    const diff = Math.floor((Date.now() - lastSynced) / 60000)
    if (diff < 1) return 'Just now'
    if (diff === 1) return '1 min ago'
    return `${diff} min ago`
  }

  const getSyncStatus = (form: FormRecord, pending: number): 'synced' | 'pending' | 'new' => {
    if (pending > 0) return 'pending'
    if (form.lastSyncedAt) return 'synced'
    return 'new'
  }

  const getFieldTypes = (form: FormRecord): string[] => {
    try {
      const config = JSON.parse(form.configJson)
      if (Array.isArray(config.fields)) {
        return config.fields.map((f: { type?: string }) => f.type ?? 'field').filter(Boolean)
      }
    } catch {}
    return []
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Forms" />
      <SyncBar
        lastSynced={formatLastSynced()}
        isSyncing={isSyncing}
        canSync={isOnline}
        onSync={handleSync}
      />

      {forms.length === 0 ? (
        <EmptyState
          title="No forms yet"
          description="Scan a QR code to import a form"
        />
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadForms} />
          }
          renderItem={({ item }) => (
            <FormCard
              title={item.title}
              responses={responseCounts[item.id] ?? 0}
              fields={getFieldTypes(item)}
              syncStatus={getSyncStatus(item, unsyncedCounts[item.id] ?? 0)}
              pendingCount={unsyncedCounts[item.id] ?? 0}
              onPress={() => router.push(`/form/${item.id}`)}
              onSync={syncingFormIds.has(item.id) ? undefined : () => handleSyncForm(item.id)}
              onDelete={() => handleDeleteForm(item)}
            />
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  list: { paddingHorizontal: 16, paddingBottom: 110 },
})
