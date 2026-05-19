import { View, Text, StyleSheet } from 'react-native'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  isOnline: boolean
}

export function ConnectionBanner({ isOnline }: Props) {
  return (
    <View style={[styles.banner, isOnline ? styles.bannerOnline : styles.bannerOffline]}>
      <View style={[styles.inner]}>
        <View style={[styles.dot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <Text style={[styles.text, isOnline ? styles.textOnline : styles.textOffline]}>
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
    paddingVertical: 10,
    borderBottomWidth: TOKENS.border.width,
  },
  bannerOnline: {
    backgroundColor: TOKENS.colors.green50,
    borderBottomColor: '#d9f0dc',
  },
  bannerOffline: {
    backgroundColor: TOKENS.colors.amber50,
    borderBottomColor: '#f5e3b8',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  dotOnline: { backgroundColor: TOKENS.colors.green500 },
  dotOffline: { backgroundColor: TOKENS.colors.amber500 },
  text: { fontSize: 13, fontWeight: TOKENS.type.weightSemibold },
  textOnline: { color: TOKENS.colors.green700 },
  textOffline: { color: TOKENS.colors.amber800 },
})
