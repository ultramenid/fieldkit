import { useState, useCallback } from 'react'
import { View, Text, StyleSheet, Alert } from 'react-native'
import { useFocusEffect } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { deleteAllData } from '../../src/db/database'
import { getServerUrl } from '../../src/api/server'
import { TOKENS } from '../../src/theme/tokens'
import { ScreenHeader } from '../../components/ScreenHeader'
import { PillButton } from '../../components/PillButton'

const SERVER_URL_KEY = 'fieldkit_server_url'

export default function Settings() {
  const [serverUrl, setServerUrl] = useState('')

  useFocusEffect(
    useCallback(() => {
      getServerUrl().then(setServerUrl)
    }, [])
  )

  const handleResetServerUrl = () => {
    Alert.alert(
      'Reset server URL',
      `Current: ${serverUrl || '(not set)'}\n\nClear it and re-scan a form QR to set a new one.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset', style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(SERVER_URL_KEY)
            setServerUrl('')
          },
        },
      ]
    )
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

      <View style={styles.content}>
        {/* Server URL section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server connection</Text>
          <View style={styles.urlRow}>
            <Text style={styles.urlLabel}>URL</Text>
            <Text style={styles.urlValue} numberOfLines={1}>
              {serverUrl || 'Not configured'}
            </Text>
          </View>
          {serverUrl ? (
            <PillButton
              title="Reset Server URL"
              variant="outline"
              onPress={handleResetServerUrl}
            />
          ) : (
            <Text style={styles.hint}>
              Scan a form QR code to set the server URL automatically.
            </Text>
          )}
        </View>

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
  urlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: TOKENS.colors.gray200,
    borderRadius: TOKENS.radius.pill,
  },
  urlLabel: {
    fontSize: TOKENS.fontSize.small,
    color: TOKENS.colors.gray500,
  },
  urlValue: {
    flex: 1,
    fontSize: TOKENS.fontSize.small,
    fontFamily: 'monospace',
    color: TOKENS.colors.black,
  },
  hint: {
    fontSize: TOKENS.fontSize.small,
    color: TOKENS.colors.gray400,
  },
  footer: {
    paddingBottom: 34,
    alignItems: 'center',
  },
  version: { fontSize: TOKENS.fontSize.small, color: TOKENS.colors.gray400 },
})
