import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useConnectivity } from '../src/hooks/useConnectivity'

export default function RootLayout() {
  useConnectivity()

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
            headerShadowVisible: false,
            headerStyle: { backgroundColor: '#ffffff' },
          }}
        />
      </Stack>
    </>
  )
}
