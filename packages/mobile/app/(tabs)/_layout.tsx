import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { useStore } from '../../src/store'

function ConnectionBanner() {
  const isOnline = useStore((s) => s.isOnline)
  return (
    <View style={[styles.banner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={isOnline ? styles.bannerTextOnline : styles.bannerTextOffline}>
        {isOnline ? 'Connected to server' : 'Offline — responses saved locally'}
      </Text>
    </View>
  )
}

export default function TabLayout() {
  return (
    <>
      <ConnectionBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#000',
          tabBarInactiveTintColor: '#a3a3a3',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#e5e5e5',
            backgroundColor: '#fff',
          },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '500' as const },
        }}
      >
        <Tabs.Screen
          name="forms"
          options={{
            title: 'Forms',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'📋'}</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'📷'}</Text>
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 18, color }}>{'⚙'}</Text>
            ),
          }}
        />
      </Tabs>
    </>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  bannerOnline: { backgroundColor: '#f0fdf4' },
  bannerOffline: { backgroundColor: '#fefce8' },
  bannerTextOnline: { fontSize: 12, fontWeight: '500', color: '#166534' },
  bannerTextOffline: { fontSize: 12, fontWeight: '500', color: '#854d0e' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOnline: { backgroundColor: '#22c55e' },
  dotOffline: { backgroundColor: '#f59e0b' },
})
