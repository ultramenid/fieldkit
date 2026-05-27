/**
 * Rich text answer formatting for local-server admin (responses table + detail).
 * Mirrors apps/web/src/lib/sanitize-rich-text-dom.ts (browser DOMParser).
 */
;(function (global) {
  const TEXT_NODE = 3
  const ELEMENT_NODE = 1

  const ALLOWED_TAGS = new Set([
    'P', 'BR', 'STRONG', 'EM', 'U', 'S', 'CODE', 'PRE', 'BLOCKQUOTE', 'MARK',
    'SUP', 'SUB', 'A', 'UL', 'OL', 'LI', 'IMG',
  ])
  const SAFE_HREF_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
  const SAFE_SRC_PROTOCOLS = new Set(['http:', 'https:'])
  const ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify'])
  const EMPTY_ANSWER = '—'

  function hasExplicitScheme(value) {
    return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
  }

  function isSafeHref(href) {
    try {
      if (!hasExplicitScheme(href)) return false
      return SAFE_HREF_PROTOCOLS.has(new URL(href).protocol)
    } catch {
      return false
    }
  }

  function isSafeSrc(src) {
    if (src.startsWith('data:image/')) return true
    try {
      if (!hasExplicitScheme(src)) return false
      return SAFE_SRC_PROTOCOLS.has(new URL(src).protocol)
    } catch {
      return false
    }
  }

  function preserveEmptyParagraphs(html) {
    return html.replace(/<p([^>]*)>\s*<\/p>/gi, '<p$1><br></p>')
  }

  function blockTagName(tag) {
    if (tag === 'DIV') return 'p'
    if (ALLOWED_TAGS.has(tag)) return tag.toLowerCase()
    return null
  }

  function sanitizeNode(node, doc) {
    if (node.nodeType === TEXT_NODE) return doc.createTextNode(node.textContent ?? '')
    if (node.nodeType !== ELEMENT_NODE) return null

    const el = node
    const blockTag = blockTagName(el.tagName)
    if (!blockTag) {
      if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return null
      const fragment = doc.createDocumentFragment()
      Array.from(el.childNodes).forEach((child) => {
        const clean = sanitizeNode(child, doc)
        if (clean) fragment.appendChild(clean)
      })
      return fragment
    }

    const cleanEl = doc.createElement(blockTag)

    if (el.tagName === 'A') {
      const href = el.getAttribute('href') ?? ''
      if (href && isSafeHref(href)) {
        cleanEl.setAttribute('href', href)
        cleanEl.setAttribute('target', '_blank')
        cleanEl.setAttribute('rel', 'noopener noreferrer')
      }
    }

    if (el.tagName === 'IMG') {
      const src = el.getAttribute('src') ?? ''
      const alt = (el.getAttribute('alt') ?? '').slice(0, 300)
      if (!src || !isSafeSrc(src)) return null
      cleanEl.setAttribute('src', src)
      if (alt) cleanEl.setAttribute('alt', alt)
    }

    if (['P', 'BLOCKQUOTE', 'PRE'].includes(el.tagName)) {
      const style = el.getAttribute('style') ?? ''
      const match = style.match(/text-align\s*:\s*(left|center|right|justify)/i)
      const align = match?.[1]?.toLowerCase()
      if (align && ALIGN_VALUES.has(align)) {
        cleanEl.setAttribute('style', 'text-align:' + align)
      }
    }

    Array.from(el.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, doc)
      if (clean) cleanEl.appendChild(clean)
    })

    return cleanEl
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  function sanitizeRichTextHtml(input) {
    if (!input.trim()) return ''

    const parsed = new DOMParser().parseFromString(input, 'text/html')
    const out = document.implementation.createHTMLDocument('sanitized')

    Array.from(parsed.body.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, out)
      if (clean) out.body.appendChild(clean)
    })

    return preserveEmptyParagraphs(out.body.innerHTML)
  }

  function normalizePlainDescriptionToHtml(input) {
    const trimmed = input.trim()
    return trimmed ? '<p>' + escapeHtml(trimmed) + '</p>' : ''
  }

  function richTextPlainText(input) {
    const raw = (input ?? '').trim()
    if (!raw) return ''

    const doc = new DOMParser().parseFromString(raw, 'text/html')
    const lines = []

    for (const node of Array.from(doc.body.childNodes)) {
      if (node.nodeType === TEXT_NODE) {
        const t = node.textContent?.replace(/\u00a0/g, ' ').trim()
        if (t) lines.push(t)
        continue
      }
      if (node.nodeType !== ELEMENT_NODE) continue
      if (node.tagName === 'BR') {
        lines.push('')
        continue
      }
      const text = (node.innerText ?? node.textContent ?? '').replace(/\u00a0/g, ' ').trimEnd()
      lines.push(text)
    }

    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  }

  function isRichTextHtmlEmpty(input) {
    const raw = (input ?? '').trim()
    if (!raw) return true
    if (/<img\b/i.test(raw)) return false
    return !richTextPlainText(raw)
  }

  function prepareRichTextHtmlForDisplay(input) {
    const raw = (input ?? '').trim()
    if (!raw || isRichTextHtmlEmpty(raw)) return ''
    const hasHtmlElements = /<\s*\/?[a-z][^>]*>/i.test(raw)
    const source = hasHtmlElements ? raw : normalizePlainDescriptionToHtml(raw)
    const sanitized = sanitizeRichTextHtml(source)
    return isRichTextHtmlEmpty(sanitized) ? '' : sanitized
  }

  function richTextListPreview(html, maxLength) {
    const plain = richTextPlainText(html)
    if (!plain) return EMPTY_ANSWER
    const oneLine = plain.replace(/\n+/g, ' · ')
    if (oneLine.length <= maxLength) return oneLine
    return oneLine.slice(0, maxLength) + '…'
  }

  function formatTableCell(fieldType, value) {
    if (value == null || value === '') return EMPTY_ANSWER
    if (Array.isArray(value)) return value.length ? value.join(', ') : EMPTY_ANSWER
    if (fieldType === 'richtext' && typeof value === 'string') {
      return richTextListPreview(value, 80)
    }
    return String(value)
  }

  function formatSearchText(fieldType, value) {
    if (value == null) return ''
    if (Array.isArray(value)) return value.map(String).join(' ')
    if (fieldType === 'richtext' && typeof value === 'string') {
      return richTextPlainText(value)
    }
    return String(value)
  }

  global.FieldKitRichTextAnswers = {
    EMPTY_ANSWER,
    prepareRichTextHtmlForDisplay,
    richTextPlainText,
    isRichTextHtmlEmpty,
    formatTableCell,
    formatSearchText,
  }
})(typeof window !== 'undefined' ? window : globalThis)
