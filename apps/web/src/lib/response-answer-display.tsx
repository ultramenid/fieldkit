import type { ReactNode } from 'react'
import { RichTextDisplay } from '@/components/builder/rich-text-display'
import {
  isRichTextHtmlEmpty,
  richTextPlainText,
} from '@/lib/sanitize-rich-text'

const EMPTY_ANSWER = '—'

export function richTextAnswerPlainText(html: string): string {
  if (isRichTextHtmlEmpty(html)) return ''
  return richTextPlainText(html)
}

export function richTextAnswerListPreview(html: string, maxLength = 80): string {
  const plain = richTextAnswerPlainText(html)
  if (!plain) return EMPTY_ANSWER
  const oneLine = plain.replace(/\n+/g, ' · ')
  if (oneLine.length <= maxLength) return oneLine
  return `${oneLine.slice(0, maxLength)}…`
}

export function formatAnswerSearchText(fieldType: string, value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(String).join(' ')
  if (fieldType === 'richtext' && typeof value === 'string') {
    return richTextAnswerPlainText(value)
  }
  return String(value)
}

export function formatAnswerExportText(fieldType: string, value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.join(', ')
  if (fieldType === 'richtext' && typeof value === 'string') {
    return richTextAnswerPlainText(value)
  }
  return String(value)
}

export function formatAnswerTableCell(fieldType: string, value: unknown): string {
  if (value == null || value === '') return EMPTY_ANSWER
  if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY_ANSWER
  if (fieldType === 'richtext' && typeof value === 'string') {
    return richTextAnswerListPreview(value)
  }
  return String(value)
}

const RESPONSE_RICH_TEXT_CLASS =
  'text-[14px] text-[var(--foreground)] [&_p]:my-1 [&_p]:min-h-[1.5em] [&_p]:text-[var(--foreground)] [&_li]:text-[var(--foreground)]'

export function formatAnswerDetail(fieldType: string, value: unknown): ReactNode {
  if (value == null || value === '') return EMPTY_ANSWER
  if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY_ANSWER
  if (fieldType === 'richtext' && typeof value === 'string') {
    if (isRichTextHtmlEmpty(value)) return EMPTY_ANSWER
    return <RichTextDisplay html={value} className={RESPONSE_RICH_TEXT_CLASS} />
  }
  return String(value)
}
