import { isRichTextHtmlEmpty, richTextPlainText } from './rich-text-plain'

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** Keep empty paragraphs visible (contenteditable often emits `<p></p>`). */
export function preserveEmptyParagraphs(html: string): string {
  return html.replace(/<p([^>]*)>\s*<\/p>/gi, '<p$1><br></p>')
}

/** Strip dangerous tags; normalize DIV blocks to P for consistent spacing. */
export function sanitizeRichTextHtmlForDisplay(input: string): string {
  let html = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<div\b([^>]*)>/gi, '<p$1>')
    .replace(/<\/div>/gi, '</p>')

  html = preserveEmptyParagraphs(html)
  return html
}

export function normalizePlainToHtml(input: string): string {
  const trimmed = input.trim()
  return trimmed ? `<p>${escapeHtml(trimmed)}</p>` : ''
}

/** Prepare stored HTML for read-only RenderHtml display. */
export function prepareRichTextHtmlForDisplay(input: string): string {
  const raw = (input ?? '').trim()
  if (!raw || isRichTextHtmlEmpty(raw)) return ''
  const hasHtmlElements = /<\s*\/?[a-z][^>]*>/i.test(raw)
  const source = hasHtmlElements ? raw : normalizePlainToHtml(raw)
  const sanitized = sanitizeRichTextHtmlForDisplay(source)
  return isRichTextHtmlEmpty(sanitized) ? '' : sanitized
}

export function richTextListPreview(html: string, maxLength = 80): string {
  const plain = richTextPlainText(html)
  if (!plain) return '—'
  const oneLine = plain.replace(/\n+/g, ' · ')
  if (oneLine.length <= maxLength) return oneLine
  return `${oneLine.slice(0, maxLength)}…`
}
