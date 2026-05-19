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

      <View style={styles.center}>
        <PillButton
          title="Delete All Data"
          variant="destructive"
          onPress={handleDeleteAll}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>FieldKit Mobile v1.0.0</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: TOKENS.colors.white },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingBottom: 34,
    alignItems: 'center',
  },
  version: { fontSize: TOKENS.fontSize.small, color: TOKENS.colors.gray400 },
})
