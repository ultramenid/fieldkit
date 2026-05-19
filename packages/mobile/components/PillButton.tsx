import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  title: string
  variant?: 'filled' | 'outline' | 'destructive'
  onPress: () => void
  loading?: boolean
  disabled?: boolean
}

export function PillButton({
  title,
  variant = 'filled',
  onPress,
  loading = false,
  disabled = false,
}: Props) {
  const isFilled = variant === 'filled'
  const isDestructive = variant === 'destructive'

  return (
    <TouchableOpacity
      style={[
        styles.base,
        isFilled && styles.filled,
        isDestructive && styles.destructive,
        !isFilled && !isDestructive && styles.outline,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isFilled ? TOKENS.colors.white : TOKENS.colors.black}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isFilled && styles.textFilled,
            isDestructive && styles.textDestructive,
            !isFilled && !isDestructive && styles.textOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: { borderRadius: TOKENS.radius.pill, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  filled: { backgroundColor: TOKENS.colors.black },
  outline: { borderWidth: TOKENS.border.width, borderColor: TOKENS.colors.gray200 },
  destructive: { borderWidth: TOKENS.border.width, borderColor: TOKENS.colors.gray200 },
  disabled: { opacity: 0.5 },
  text: { fontSize: TOKENS.fontSize.body, fontWeight: TOKENS.type.weightMedium },
  textFilled: { color: TOKENS.colors.white },
  textOutline: { color: TOKENS.colors.black },
  textDestructive: { color: TOKENS.colors.red600 },
})
