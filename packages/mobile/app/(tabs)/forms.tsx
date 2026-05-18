import { useEffect, useCallback } from 'react'
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useStore } from '../../src/store'
import { getAllForms } from '../../src/db/database'
import { syncAll } from '../../src/sync/engine'
import { FormRecord } from '../../src/types'

export default function FormsList() {
  const router = useRouter()
  const forms = useStore((s) => s.forms)
  const setForms = useStore((s) => s.setForms)
  const isOnline = useStore((s) => s.isOnline)
  const isSyncing = useStore((s) => s.isSyncing)
  const setSyncing = useStore((s) => s.setSyncing)
  const lastSynced = useStore((s) => s.lastSynced)
  const setLastSynced = useStore((s) => s.setLastSynced)

  const loadForms = useCallback(async () => {
    const result = await getAllForms()
    setForms(result)
  }, [setForms])

  useEffect(() => {
    loadForms()
  }, [loadForms])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncAll()
      setLastSynced(Date.now())
    } finally {
      setSyncing(false)
    }
  }

  const formatLastSynced = () => {
    if (!lastSynced) return 'Never'
    const diff = Math.floor((Date.now() - lastSynced) / 60000)
    if (diff < 1) return 'Just now'
    if (diff === 1) return '1 min ago'
    return `${diff} min ago`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Forms</Text>
        <TouchableOpacity
          style={styles.scanBtn}
          onPress={() => router.push('/scan')}
        >
          <Text style={styles.scanBtnText}>QR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.syncBar}>
        <Text style={styles.syncInfo}>Last synced {formatLastSynced()}</Text>
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleSync}
          disabled={isSyncing || !isOnline}
        >
          {isSyncing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.syncBtnText}>Sync Now</Text>
          )}
        </TouchableOpacity>
      </View>

      {forms.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No forms yet</Text>
          <Text style={styles.emptyDesc}>Scan a QR code to import a form</Text>
        </View>
      ) : (
        <FlatList
          data={forms}
          keyExtractor={(f) => f.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={loadForms} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => router.push(`/form/${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <SyncBadge form={item} />
              </View>
              <FormMeta form={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

function SyncBadge({ form }: { form: FormRecord }) {
  if (form.lastSyncedAt) {
    return (
      <View style={[styles.badge, styles.badgeSynced]}>
        <Text style={styles.badgeTextSynced}>{'Synced'}</Text>
      </View>
    )
  }
  return (
    <View style={[styles.badge, styles.badgeNew]}>
      <Text style={styles.badgeTextNew}>New</Text>
    </View>
  )
}

function FormMeta({ form }: { form: FormRecord }) {
  let config: { fields?: unknown[] } = {}
  try { config = JSON.parse(form.configJson) } catch {}

  return (
    <View style={styles.cardMeta}>
      <Text style={styles.metaText}>{Array.isArray(config.fields) ? config.fields.length : 0} fields</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20, paddingBottom: 12,
  },
  headerTitle: { fontSize: 34, fontWeight: '700', color: '#000' },
  scanBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e5e5e5',
    alignItems: 'center', justifyContent: 'center',
  },
  scanBtnText: { fontSize: 16, fontWeight: '600', color: '#000' },
  syncBar: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16,
  },
  syncInfo: { fontSize: 13, color: '#737373' },
  syncBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 9999,
    backgroundColor: '#000',
  },
  syncBtnText: { fontSize: 13, fontWeight: '500', color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 100 },
  card: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5',
    borderRadius: 12, padding: 16, marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#000', flex: 1 },
  cardMeta: { flexDirection: 'row', gap: 12 },
  metaText: { fontSize: 13, color: '#737373' },
  badge: {
    paddingVertical: 3, paddingHorizontal: 8, borderRadius: 9999,
    marginLeft: 12,
  },
  badgeSynced: { backgroundColor: '#f0fdf4' },
  badgeNew: { backgroundColor: '#fafafa' },
  badgeTextSynced: { fontSize: 11, fontWeight: '500', color: '#166534' },
  badgeTextNew: { fontSize: 11, fontWeight: '500', color: '#737373' },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: '#737373', textAlign: 'center', lineHeight: 22 },
})
