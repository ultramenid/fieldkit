import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useConnectivity } from '../src/hooks/useConnectivity'
import { useSync } from '../src/hooks/useSync'

export default function RootLayout() {
  useConnectivity()
  useSync()

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="form/[id]"
          options={{
            headerShown: true,
            headerTitle: '',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  )
}
