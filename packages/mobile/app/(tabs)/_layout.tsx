import { Tabs } from 'expo-router'
import { ConnectionBanner } from '../../components/ConnectionBanner'
import { useStore } from '../../src/store'
import { IconTabForms, IconTabScan, IconTabSettings } from '../../src/icons'
import { TOKENS } from '../../src/theme/tokens'

export default function TabLayout() {
  const isOnline = useStore((s) => s.isOnline)

  return (
    <>
      <ConnectionBanner isOnline={isOnline} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: TOKENS.colors.black,
          tabBarInactiveTintColor: TOKENS.colors.gray400,
          tabBarStyle: {
            borderTopWidth: TOKENS.border.width,
            borderTopColor: TOKENS.colors.gray200,
            backgroundColor: TOKENS.colors.white,
          },
          tabBarLabelStyle: {
            fontSize: TOKENS.fontSize.tabLabel,
            fontWeight: TOKENS.type.weightMedium,
          },
        }}
      >
        <Tabs.Screen
          name="forms"
          options={{
            title: 'Forms',
            tabBarIcon: ({ color, size }) => (
              <IconTabForms size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <IconTabScan size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, size }) => (
              <IconTabSettings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  )
}
