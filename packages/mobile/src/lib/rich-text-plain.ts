/** Strip tags and entities; preserve line breaks from block elements. */
export function richTextPlainText(html: string): string {
  const raw = (html ?? '').trim()
  if (!raw) return ''
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function isRichTextHtmlEmpty(html: string): boolean {
  const plain = richTextPlainText(html)
  if (plain) return false
  return !/<img\b/i.test(html ?? '')
}
