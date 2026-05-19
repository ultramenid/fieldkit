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
        {isOnline ? 'Online' : 'Offline'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginRight: 16,
    marginTop: 6,
    borderRadius: TOKENS.radius.pill,
  },
  bannerOnline: { backgroundColor: TOKENS.colors.green50 },
  bannerOffline: { backgroundColor: TOKENS.colors.amber50 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotOnline: { backgroundColor: TOKENS.colors.green500 },
  dotOffline: { backgroundColor: TOKENS.colors.amber500 },
  text: { fontSize: 11, fontWeight: TOKENS.type.weightMedium },
  textOnline: { color: TOKENS.colors.green700 },
  textOffline: { color: TOKENS.colors.amber800 },
})
