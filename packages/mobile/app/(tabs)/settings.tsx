import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
} from 'react-native'
import { useStore } from '../../src/store'
import { getServerUrl, setServerUrl } from '../../src/api/server'
import { deleteAllData } from '../../src/db/database'

export default function Settings() {
  const [url, setUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const isOnline = useStore((s) => s.isOnline)
  const setServerUrlStore = useStore((s) => s.setServerUrl)

  useEffect(() => {
    getServerUrl().then(setUrl)
  }, [])

  const handleSaveUrl = async () => {
    await setServerUrl(url)
    setServerUrlStore(url)
    Alert.alert('Saved', 'Server URL saved.')
  }

  const handleSyncAll = async () => {
    setSyncing(true)
    try {
      // syncAll will be wired in Task 17
      Alert.alert('Done', 'Syncing will be available soon.')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Error', msg)
    } finally {
      setSyncing(false)
    }
  }

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all data',
      'This will remove all forms and responses. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            await deleteAllData()
            Alert.alert('Done', 'All data deleted.')
          },
        },
      ]
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://fieldkit.app"
          placeholderTextColor="#a3a3a3"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSaveUrl}>
          <Text style={styles.btnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={handleSyncAll}
          disabled={syncing || !isOnline}
        >
          <Text style={[styles.btnText, styles.btnPrimaryText]}>
            {syncing ? 'Syncing...' : 'Sync All Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.version}>FieldKit Mobile v1.0.0</Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.btnDestructive} onPress={handleDeleteAll}>
          <Text style={styles.btnDestructiveText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 34, fontWeight: '700', color: '#000', marginBottom: 32 },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: '500', color: '#000', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 15,
    color: '#000', marginBottom: 12,
  },
  btn: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 12, alignItems: 'center',
  },
  btnText: { fontSize: 14, fontWeight: '500', color: '#000' },
  btnPrimary: { backgroundColor: '#000', borderColor: '#000' },
  btnPrimaryText: { color: '#fff' },
  version: { fontSize: 13, color: '#a3a3a3', textAlign: 'center' },
  btnDestructive: {
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    paddingVertical: 12, alignItems: 'center',
  },
  btnDestructiveText: { fontSize: 14, fontWeight: '500', color: '#dc2626' },
})
