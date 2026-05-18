import { StyleSheet, useWindowDimensions } from 'react-native'
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html'

interface Props {
  html: string
}

export function Description({ html }: Props) {
  const { width } = useWindowDimensions()

  if (!html) return null

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
})
