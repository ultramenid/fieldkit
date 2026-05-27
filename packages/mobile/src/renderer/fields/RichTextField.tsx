import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'
import { FieldWrapper } from './FieldWrapper'
import { buildRichTextEditorHtml } from '../../lib/rich-text-editor-html'
import { FieldConfig } from '../../types'

interface Props {
  field: FieldConfig
  value: string
  error?: string
  onChange: (val: string) => void
  onBlur: () => void
  dismissSignal?: number
}

type WebViewRef = {
  injectJavaScript: (script: string) => void
}

export function RichTextField({ field, value, error, onChange, onBlur, dismissSignal }: Props) {
  const webRef = useRef<WebViewRef | null>(null)
  const [editorHeight, setEditorHeight] = useState(140)
  const webViewKey = useMemo(
    () => `${field.id}:${field.placeholder ?? ''}:${JSON.stringify(field.editorFeatures ?? {})}`,
    [field.editorFeatures, field.id, field.placeholder],
  )

  const editorHtml = useMemo(
    () =>
      buildRichTextEditorHtml(
        value,
        field.placeholder ?? 'Write your answer…',
        field.editorFeatures,
      ),
    // Rebuild when field identity / toolbar config changes; value synced via injectJS.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.id, field.placeholder, field.editorFeatures],
  )

  const pushValueToWebView = useCallback((html: string) => {
    const escaped = JSON.stringify(html ?? '')
    webRef.current?.injectJavaScript(`window.setEditorHtml(${escaped}); true;`)
  }, [])

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data) as {
          type: string
          html?: string
          height?: number
        }
        if (data.type === 'change' && typeof data.html === 'string') {
          onChange(data.html)
        } else if (data.type === 'blur') {
          onBlur()
        } else if (data.type === 'height' && typeof data.height === 'number') {
          const nextHeight = Math.max(140, Math.ceil(data.height))
          setEditorHeight((prev) => (prev === nextHeight ? prev : nextHeight))
        } else if (data.type === 'ready') {
          pushValueToWebView(value)
        }
      } catch {
        // ignore malformed messages
      }
    },
    [onBlur, onChange, pushValueToWebView, value],
  )

  useEffect(() => {
    if (!dismissSignal) return
    webRef.current?.injectJavaScript('window.blurEditor?.(); true;')
  }, [dismissSignal])

  return (
    <FieldWrapper label={field.label} helpText={field.helpText} error={error} required={field.required}>
      <View style={[styles.wrap, error ? styles.wrapError : null]}>
        {/* WebView package typings target pre-React-19 class components */}
        {/* @ts-expect-error react-native-webview + React 19 JSX compatibility */}
        <WebView
          key={webViewKey}
          ref={webRef}
          originWhitelist={['*']}
          source={{ html: editorHtml }}
          onMessage={handleMessage}
          scrollEnabled={false}
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          style={[styles.webview, { height: editorHeight }]}
          nestedScrollEnabled
        />
      </View>
    </FieldWrapper>
  )
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 140,
  },
  wrapError: { borderColor: '#dc2626' },
  webview: { width: '100%', minHeight: 140, backgroundColor: 'transparent' },
})
