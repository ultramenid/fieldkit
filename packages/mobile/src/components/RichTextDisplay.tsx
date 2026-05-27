import { StyleSheet, useWindowDimensions, Text, Linking, TouchableOpacity } from 'react-native'
import RenderHtml, { MixedStyleDeclaration } from 'react-native-render-html'
import { prepareRichTextHtmlForDisplay } from '../lib/prepare-rich-text-html'

const DESC_PLACEHOLDER_PREFIX = 'Full description available at '

export const RICH_TEXT_TAG_STYLES: Record<string, MixedStyleDeclaration> = {
  p: { marginTop: 0, marginBottom: 8, minHeight: 22, lineHeight: 22 },
  div: { marginTop: 0, marginBottom: 8, minHeight: 22, lineHeight: 22 },
  strong: { fontWeight: '600' },
  em: { fontStyle: 'italic' },
  u: { textDecorationLine: 'underline' },
  s: { textDecorationLine: 'line-through' },
  a: { color: '#8b4513', textDecorationLine: 'underline' },
  ul: { marginBottom: 8, paddingLeft: 20 },
  ol: { marginBottom: 8, paddingLeft: 20 },
  li: { marginBottom: 4, lineHeight: 22 },
  blockquote: {
    borderLeftWidth: 2,
    borderLeftColor: '#e5e5e5',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  pre: {
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  code: { fontFamily: 'monospace', fontSize: 13, backgroundColor: '#fafafa' },
  mark: { backgroundColor: 'rgba(139, 69, 19, 0.18)' },
  img: { marginVertical: 8 },
}

interface Props {
  html: string
  /** Base text color for body copy */
  color?: string
  fontSize?: number
}

export function RichTextDisplay({ html, color = '#737373', fontSize = 15 }: Props) {
  const { width } = useWindowDimensions()
  const prepared = prepareRichTextHtmlForDisplay(html)

  if (!prepared) return null

  if (prepared.startsWith(DESC_PLACEHOLDER_PREFIX)) {
    const url = prepared.slice(DESC_PLACEHOLDER_PREFIX.length)
    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)}>
        <Text style={[styles.placeholder, { color: '#8b4513' }]}>
          Full description available online — tap to open
        </Text>
      </TouchableOpacity>
    )
  }

  const tagsStyles = Object.fromEntries(
    Object.entries(RICH_TEXT_TAG_STYLES).map(([tag, style]) => [
      tag,
      { ...style, ...(tag !== 'a' && tag !== 'mark' ? { color } : {}) },
    ]),
  ) as Record<string, MixedStyleDeclaration>

  return (
    <RenderHtml
      contentWidth={width - 40}
      source={{ html: prepared }}
      baseStyle={{ fontSize, color, lineHeight: 22 }}
      tagsStyles={tagsStyles}
      enableExperimentalMarginCollapsing
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    fontSize: 14,
    textDecorationLine: 'underline',
    lineHeight: 22,
    marginBottom: 8,
  },
})
