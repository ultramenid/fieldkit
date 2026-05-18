import { StyleSheet, useWindowDimensions, Text, Linking, TouchableOpacity } from 'react-native'
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html'

const DESC_PLACEHOLDER_PREFIX = 'Full description available at '

interface Props {
  html: string
}

export function Description({ html }: Props) {
  const { width } = useWindowDimensions()

  if (!html) return null

  if (html.startsWith(DESC_PLACEHOLDER_PREFIX)) {
    const url = html.slice(DESC_PLACEHOLDER_PREFIX.length)
    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <Text style={styles.placeholder}>Full description available online — tap to open</Text>
      </TouchableOpacity>
    )
  }

  return (
    <RenderHtml
      contentWidth={width - 40}
      source={{ html }}
      baseStyle={styles.base as MixedStyleDeclaration}
      tagsStyles={{
        p: { marginBottom: 8 } as MixedStyleDeclaration,
        strong: { fontWeight: '600' } as MixedStyleDeclaration,
        em: { fontStyle: 'italic' } as MixedStyleDeclaration,
        u: { textDecorationLine: 'underline' } as MixedStyleDeclaration,
        a: { color: '#000', textDecorationLine: 'underline' } as MixedStyleDeclaration,
      }}
    />
  )
}

const styles = StyleSheet.create({
  base: { fontSize: 15, color: '#737373', lineHeight: 22 },
  placeholder: {
    fontSize: 14,
    color: '#8b4513',
    textDecorationLine: 'underline',
    lineHeight: 22,
    marginBottom: 8,
  },
})
