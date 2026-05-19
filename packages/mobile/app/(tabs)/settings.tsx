import { useState } from 'react'
import {
  View, Text, StyleSheet, Alert,
} from 'react-native'
import { useStore } from '../../src/store'
import { deleteAllData } from '../../src/db/database'
import { TOKENS } from '../../src/theme/tokens'
import { ScreenHeader } from '../../components/ScreenHeader'
import { PillButton } from '../../components/PillButton'

export default function Settings() {
  const [syncing, setSyncing] = useState(false)
  const isOnline = useStore((s) => s.isOnline)

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
  version: { fontSize: TOKENS.fontSize.small, color: TOKENS.colors.gray400, textAlign: 'center' },
})
