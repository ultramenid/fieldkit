import { View, Text, StyleSheet } from 'react-native'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  isOnline: boolean
}

export function ConnectionBanner({ isOnline }: Props) {
  return (
    <View style={[styles.banner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
      <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
      <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
        {isOnline ? 'Connected to server' : 'Offline — responses saved locally'}
      </Text>
    </View>
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
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: TOKENS.radius.pill,
  },
  bannerOnline: { backgroundColor: TOKENS.colors.green50 },
  bannerOffline: { backgroundColor: TOKENS.colors.amber50 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOnline: { backgroundColor: TOKENS.colors.green500 },
  dotOffline: { backgroundColor: TOKENS.colors.amber500 },
  text: { fontSize: 12, fontWeight: TOKENS.type.weightMedium },
  textOnline: { color: TOKENS.colors.green700 },
  textOffline: { color: TOKENS.colors.amber800 },
})
