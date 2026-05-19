import { useState, useRef, useEffect, useCallback } from 'react'
import { View, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useRouter, useFocusEffect } from 'expo-router'
import { useStore } from '../../src/store'
import { upsertForm, getForm } from '../../src/db/database'
import { fetchFormConfig, getServerUrl, setServerUrl } from '../../src/api/server'
import { FormConfig, FormRecord } from '../../src/types'

const CONFIG_PREFIX = 'fieldkit://config/'

function tryParseConfig(data: string): FormConfig | null {
  try {
    const raw = data.startsWith(CONFIG_PREFIX) ? data.slice(CONFIG_PREFIX.length) : data
    const parsed = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.formId === 'string' &&
      typeof parsed.title === 'string' &&
      Array.isArray(parsed.fields) &&
      typeof parsed.secret === 'string'
    ) {
      return parsed as FormConfig
    }
  } catch {
    // not JSON, fall through to URL parsing
  }
  return null
}

function buildRecord(config: FormConfig): FormRecord {
  return {
    id: config.formId,
    title: config.title,
    description: config.description,
    configJson: JSON.stringify(config),
    secret: config.secret,
    importedAt: Date.now(),
    lastSyncedAt: null,
  }
}

export default function ScanScreen() {
  const [scanning, setScanning] = useState(false)
  const [importing, setImporting] = useState(false)
  const [cameraActive, setCameraActive] = useState(true)
  const scanningRef = useRef(false)
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setCameraActive(true)
      scanningRef.current = false
      setScanning(false)

      return () => {
        setCameraActive(false)
      }
    }, [])
  )

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

  const reenableScan = () => {
    if (scanTimerRef.current) clearTimeout(scanTimerRef.current)
    scanTimerRef.current = setTimeout(() => {
      scanningRef.current = false
      setScanning(false)
      setCameraActive(true)
    }, 2000)
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanningRef.current || importing) return
    scanningRef.current = true
    setScanning(true)
    setCameraActive(false)

    try {
      const parsed = tryParseConfig(data)
      if (parsed) {
        await importConfig(parsed)
        return
      }

      const match = data.match(/\/f\/([a-zA-Z0-9_-]+)/)
      if (!match) {
        Alert.alert('Invalid QR', 'This QR code does not contain a valid form link or config.')
        reenableScan()
        return
      }

      const formId = match[1]
      const existing = await getForm(formId)
      if (existing) {
        Alert.alert(
          'Already imported',
          'This form is already imported. Do you want to update it?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => reenableScan() },
            { text: 'Update', onPress: () => importFromUrl(formId, data) },
          ]
        )
        return
      }

      await importFromUrl(formId, data)
    } catch {
      Alert.alert('Error', 'Failed to scan QR code.')
      reenableScan()
    }
  }

  const importFromUrl = async (formId: string, qrData: string) => {
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
        reenableScan()
        return
      }

      const config = await fetchFormConfig(formId, serverUrl)
      await saveConfigLocally(config)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Import failed', msg)
      reenableScan()
    } finally {
      setImporting(false)
    }
  }

  const importConfig = async (config: FormConfig) => {
    setImporting(true)

    try {
      const existing = await getForm(config.formId)
      if (existing) {
        Alert.alert(
          'Already imported',
          'This form is already imported. Do you want to update it?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => { setImporting(false); reenableScan() } },
            { text: 'Update', onPress: () => saveConfigLocally(config) },
          ]
        )
        return
      }

      await saveConfigLocally(config)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Import failed', msg)
      reenableScan()
    } finally {
      setImporting(false)
    }
  }

  const saveConfigLocally = async (config: FormConfig) => {
    setImporting(true)
    try {
      const record = buildRecord(config)
      await upsertForm(record)
      addForm(record)
      scanningRef.current = true
      setScanning(true)
      setCameraActive(false)
      router.replace('/(tabs)/forms')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      Alert.alert('Import failed', msg)
      reenableScan()
    } finally {
      setImporting(false)
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        active={cameraActive}
        onBarcodeScanned={cameraActive && !scanning && !importing ? handleBarcodeScanned : undefined}
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
  permissionTitle: {
    fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 6,
  },
  permissionDesc: {
    fontSize: 14, color: '#737373', marginBottom: 16, textAlign: 'center',
  },
  permissionLink: {
    fontSize: 14, color: '#000', fontWeight: '500',
    paddingVertical: 14, paddingHorizontal: 28,
    borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 9999,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute', top: '30%', left: '12%', right: '12%',
    aspectRatio: 1, justifyContent: 'space-between',
  },
  cornerTop: {
    width: 40, height: 40,
    borderTopWidth: 3, borderLeftWidth: 3,
    borderColor: '#fff', borderRadius: 4,
  },
  cornerBottom: {
    width: 40, height: 40,
    borderBottomWidth: 3, borderRightWidth: 3,
    borderColor: '#fff', borderRadius: 4,
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute', bottom: 60, left: 0, right: 0,
    alignItems: 'center',
  },
  footerText: { color: '#fff', fontSize: 14 },
  importingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  importingText: { color: '#fff', fontSize: 14 },
})
