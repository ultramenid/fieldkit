import { View, Text, StyleSheet } from 'react-native'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  types: string[]
}

export function FieldTags({ types }: Props) {
  const visible = types.slice(0, 5)
  const remaining = types.length - 5

  return (
    <View style={styles.row}>
      {visible.map((type, idx) => (
        <View key={`${type}-${idx}`} style={styles.tag}>
          <Text style={styles.tagText}>{type}</Text>
        </View>
      ))}
      {remaining > 0 && (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{remaining} more</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: TOKENS.radius.pill,
    backgroundColor: TOKENS.colors.gray50,
    borderWidth: TOKENS.border.width,
    borderColor: TOKENS.colors.gray200,
  },
  tagText: { fontSize: TOKENS.fontSize.tiny, color: TOKENS.colors.gray500, fontFamily: TOKENS.type.monoFamily },
})
