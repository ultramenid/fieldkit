import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { ReactNode } from 'react'
import { TOKENS } from '../src/theme/tokens'

interface Action {
  icon: ReactNode
  onPress: () => void
  accessibilityLabel?: string
}

interface Props {
  title: string
  action?: Action
}

export function ScreenHeader({ title, action }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.titleGroup}>
        <Text style={styles.title}>{title}</Text>
      </View>
      {action && (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={action.onPress}
          accessibilityLabel={action.accessibilityLabel ?? ''}
        >
          {action.icon}
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: TOKENS.spacing.padding,
    paddingBottom: 12,
    paddingTop: 8,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: TOKENS.type.displayFamily,
    fontSize: TOKENS.fontSize.title,
    fontWeight: TOKENS.type.weightBold,
    color: TOKENS.colors.black,
    letterSpacing: -0.02,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: TOKENS.colors.gray50,
    borderWidth: TOKENS.border.width,
    borderColor: TOKENS.colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
