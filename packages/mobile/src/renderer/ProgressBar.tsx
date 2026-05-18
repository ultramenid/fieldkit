import { View, StyleSheet } from 'react-native'

interface Props {
  completed: number
  total: number
}

export function ProgressBar({ completed, total }: Props) {
  const pct = total > 0 ? completed / total : 0
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { flex: pct }]} />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 3, backgroundColor: '#e5e5e5', borderRadius: 2, overflow: 'hidden',
    flex: 1,
  },
  fill: {
    height: '100%', backgroundColor: '#000', borderRadius: 2,
  },
})
