import { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  isOnline: boolean
}

export function ConnectionBanner({ isOnline }: Props) {
  const insets = useSafeAreaInsets()
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!isOnline) {
      pulse.setValue(1)
      return
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    )

    animation.start()
    return () => animation.stop()
  }, [isOnline])

  return (
    <View style={[styles.banner, { paddingTop: Math.max(insets.top, 8) }]}>
      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.dot,
            isOnline ? styles.dotOnline : styles.dotOffline,
            { opacity: pulse },
          ]}
        />
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
