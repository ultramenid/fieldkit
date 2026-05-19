import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { TOKENS } from '../src/theme/tokens'
import { IconSync } from '../src/icons'

interface Props {
  lastSynced: string
  isSyncing: boolean
  canSync: boolean
  onSync: () => void
}

export function SyncBar({ lastSynced, isSyncing, canSync, onSync }: Props) {
  return (
    <View style={styles.bar}>
      <Text style={styles.info}>Last synced {lastSynced}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={onSync}
        disabled={isSyncing || !canSync}
      >
        {isSyncing ? (
          <ActivityIndicator color={TOKENS.colors.white} size="small" />
        ) : (
          <View style={styles.btnContent}>
            <IconSync size={14} color={TOKENS.colors.white} />
            <Text style={styles.btnText}>Sync All</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TOKENS.spacing.padding,
    paddingBottom: 16,
  },
  info: {
    fontSize: TOKENS.fontSize.small,
    color: TOKENS.colors.gray500,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: TOKENS.radius.pill,
    backgroundColor: TOKENS.colors.black,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  btnText: {
    fontSize: TOKENS.fontSize.small,
    fontWeight: TOKENS.type.weightMedium,
    color: TOKENS.colors.white,
  },
})
