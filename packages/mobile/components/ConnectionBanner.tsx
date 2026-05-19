import { View, Text, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  isOnline: boolean
}

export function ConnectionBanner({ isOnline }: Props) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.banner, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.inner}>
        <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={styles.text}>
          {isOnline ? 'Connected to server' : 'Offline — responses saved locally'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 6,
    backgroundColor: TOKENS.colors.white,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOnline: { backgroundColor: TOKENS.colors.green500 },
  dotOffline: { backgroundColor: TOKENS.colors.amber500 },
  text: { fontSize: 11, fontWeight: TOKENS.type.weightMedium, color: TOKENS.colors.gray500 },
})
