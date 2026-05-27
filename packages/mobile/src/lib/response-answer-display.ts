import { richTextListPreview } from './prepare-rich-text-html'
import { richTextPlainText } from './rich-text-plain'

const EMPTY = '—'

export function formatAnswerTableCell(fieldType: string, value: unknown): string {
  if (value == null || value === '') return EMPTY
  if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY
  if (fieldType === 'richtext' && typeof value === 'string') {
    return richTextListPreview(value)
  }
  return String(value)
}

export function formatAnswerPlain(fieldType: string, value: unknown): string {
  if (value == null || value === '') return EMPTY
  if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY
  if (fieldType === 'richtext' && typeof value === 'string') {
    const plain = richTextPlainText(value)
    return plain || EMPTY
  }
  return String(value)
}
