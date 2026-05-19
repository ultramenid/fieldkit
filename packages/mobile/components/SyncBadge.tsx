import { View, Text, TouchableOpacity, StyleSheet, GestureResponderEvent } from 'react-native'
import { TOKENS } from '../src/theme/tokens'
import { IconCheck, IconSync } from '../src/icons'

interface Props {
  status: 'synced' | 'pending' | 'new'
  pendingCount?: number
  onPress?: (event: GestureResponderEvent) => void
}

export function SyncBadge({ status, pendingCount, onPress }: Props) {
  const badge = () => {
    if (status === 'pending') {
      return (
        <View style={[styles.badge, styles.badgePending]}>
          <IconSync size={10} color={TOKENS.colors.amber700} />
          <Text style={styles.badgeTextPending}>{pendingCount} pending</Text>
        </View>
      )
    }

    if (status === 'synced') {
      return (
        <View style={[styles.badge, styles.badgeSynced]}>
          <IconCheck size={10} color={TOKENS.colors.green700} />
          <Text style={styles.badgeTextSynced}>Synced</Text>
        </View>
      )
    }

    return (
      <View style={[styles.badge, styles.badgeNew]}>
        <Text style={styles.badgeTextNew}>New</Text>
      </View>
    )
  }

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.8}>{badge()}</TouchableOpacity>
  }
  return badge()
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: TOKENS.radius.pill,
  },
  badgeSynced: { backgroundColor: TOKENS.colors.green50 },
  badgePending: { backgroundColor: TOKENS.colors.amber50 },
  badgeNew: { backgroundColor: TOKENS.colors.gray50 },
  badgeTextSynced: { fontSize: 11, fontWeight: TOKENS.type.weightMedium, color: TOKENS.colors.green700 },
  badgeTextPending: { fontSize: 11, fontWeight: TOKENS.type.weightMedium, color: TOKENS.colors.amber700 },
  badgeTextNew: { fontSize: 11, fontWeight: TOKENS.type.weightMedium, color: TOKENS.colors.gray500 },
})
