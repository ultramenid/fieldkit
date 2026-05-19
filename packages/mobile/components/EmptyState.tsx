import { View, Text, StyleSheet } from 'react-native'
import { TOKENS } from '../src/theme/tokens'

interface Props {
  title: string
  description: string
}

export function EmptyState({ title, description }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{description}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  title: { fontSize: TOKENS.fontSize.cardTitle, fontWeight: TOKENS.type.weightSemibold, color: TOKENS.colors.black, marginBottom: 6 },
  desc: { fontSize: TOKENS.fontSize.body, color: TOKENS.colors.gray500, textAlign: 'center', lineHeight: 22 },
})
