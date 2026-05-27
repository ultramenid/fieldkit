import { View, Text, StyleSheet, Alert } from 'react-native'
import { deleteAllData } from '../../src/db/database'
import { TOKENS } from '../../src/theme/tokens'
import { ScreenHeader } from '../../components/ScreenHeader'
import { PillButton } from '../../components/PillButton'

export default function Settings() {
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

      <View style={styles.content}>
        {/* Danger zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>
          <PillButton
            title="Delete All Data"
            variant="destructive"
            onPress={handleDeleteAll}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>FieldKit Mobile v1.0.0</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 32,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: TOKENS.fontSize.body,
    fontWeight: TOKENS.type.weightSemibold,
    color: TOKENS.colors.black,
  },
  footer: {
    paddingBottom: 34,
    alignItems: 'center',
  },
  version: { fontSize: TOKENS.fontSize.small, color: TOKENS.colors.gray400 },
})
