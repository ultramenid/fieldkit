import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, StyleSheet, Alert,
} from 'react-native'
import { useStore } from '../../src/store'
import { getServerUrl, setServerUrl } from '../../src/api/server'
import { deleteAllData } from '../../src/db/database'
import { TOKENS } from '../../src/theme/tokens'
import { ScreenHeader } from '../../components/ScreenHeader'
import { PillButton } from '../../components/PillButton'

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
      <ScreenHeader title="Settings" />

      <View style={styles.section}>
        <Text style={styles.label}>Server URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://fieldkit.app"
          placeholderTextColor={TOKENS.colors.gray400}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <PillButton title="Save" onPress={handleSaveUrl} />
      </View>

      <View style={styles.section}>
        <PillButton
          title={syncing ? 'Syncing...' : 'Sync All Now'}
          variant="filled"
          onPress={handleSyncAll}
          loading={syncing}
          disabled={syncing || !isOnline}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.version}>FieldKit Mobile v1.0.0</Text>
      </View>

      <View style={styles.section}>
        <PillButton
          title="Delete All Data"
          variant="destructive"
          onPress={handleDeleteAll}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  section: { marginHorizontal: TOKENS.spacing.padding, marginBottom: TOKENS.spacing.section },
  label: { fontSize: 14, fontWeight: TOKENS.type.weightMedium, color: TOKENS.colors.black, marginBottom: 8 },
  input: {
    borderWidth: TOKENS.border.width, borderColor: TOKENS.colors.gray200,
    borderRadius: TOKENS.radius.container, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: TOKENS.fontSize.body, color: TOKENS.colors.black, marginBottom: 12,
  },
  version: { fontSize: TOKENS.fontSize.small, color: TOKENS.colors.gray400, textAlign: 'center' },
})
