import { useState } from 'react'
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter } from 'expo-router'
import { useStore } from '../../src/store'
import { upsertForm, getForm } from '../../src/db/database'
import { fetchFormConfig, getServerUrl, setServerUrl } from '../../src/api/server'
import { FormRecord } from '../../src/types'

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const router = useRouter()
  const addForm = useStore((s) => s.addForm)
  const setServerUrlStore = useStore((s) => s.setServerUrl)
  const [permission, requestPermission] = useCameraPermissions()

  if (!permission) return <View style={styles.container} />
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionDesc}>Allow camera to scan QR codes</Text>
        <Text style={styles.permissionLink} onPress={requestPermission}>
          Grant Permission
        </Text>
      </View>
    )
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanning || importing) return
    setScanning(true)

    try {
      const match = data.match(/\/f\/([a-zA-Z0-9_-]+)/)
      if (!match) {
        Alert.alert('Invalid QR', 'This QR code does not contain a valid form link.')
        setScanning(false)
        return
      }

      const formId = match[1]
      const existing = await getForm(formId)
      if (existing) {
        Alert.alert(
          'Already imported',
          'This form is already imported. Do you want to update it?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setScanning(false) },
            { text: 'Update', onPress: () => importForm(formId, data) },
          ]
        )
        return
      }

      await importForm(formId, data)
    } catch {
      Alert.alert('Error', 'Failed to scan QR code.')
      setScanning(false)
    }
  }

  const importForm = async (formId: string, qrData: string) => {
    setImporting(true)

    try {
      const qrOrigin = qrData.match(/^(https?:\/\/[^/]+)/)?.[1]
      let serverUrl = await getServerUrl()
      if (!serverUrl && qrOrigin) {
        serverUrl = qrOrigin
        await setServerUrl(serverUrl)
        setServerUrlStore(serverUrl)
      }
      if (!serverUrl) {
        Alert.alert('Server not configured', 'Set the server URL in Settings first.')
        return
      }

      const config = await fetchFormConfig(formId, serverUrl)
      const now = Date.now()
      const record: FormRecord = {
        id: config.formId,
        title: config.title,
        description: config.description,
        configJson: JSON.stringify(config),
        secret: config.secret,
        importedAt: now,
        lastSyncedAt: null,
      }

      await upsertForm(record)
      addForm(record)
      Alert.alert('Imported', `"${config.title}" is ready to fill.`, [
        { text: 'OK', onPress: () => router.push('/forms') },
      ])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Import failed', msg)
    } finally {
      setScanning(false)
      setImporting(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.cornerTop} />
        <View style={styles.cornerBottom} />
      </View>
      <View style={styles.footer}>
        {importing ? (
          <View style={styles.importingRow}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.importingText}>Importing form...</Text>
          </View>
        ) : (
          <Text style={styles.footerText}>Point camera at a form QR code</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff', padding: 40,
  },
  permissionTitle: { fontSize: 17, fontWeight: '600', marginBottom: 6 },
  permissionDesc: { fontSize: 14, color: '#737373', marginBottom: 16 },
  permissionLink: { fontSize: 14, color: '#000', fontWeight: '500' },
  overlay: {
    position: 'absolute', top: '30%', left: '12%', right: '12%',
    aspectRatio: 1, justifyContent: 'space-between',
  },
  cornerTop: {
    width: 40, height: 40, borderTopWidth: 3, borderLeftWidth: 3,
    borderColor: '#fff', borderRadius: 4,
  },
  cornerBottom: {
    width: 40, height: 40, borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: '#fff', borderRadius: 4, alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center',
  },
  footerText: { color: '#fff', fontSize: 14 },
  importingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  importingText: { color: '#fff', fontSize: 14 },
})
