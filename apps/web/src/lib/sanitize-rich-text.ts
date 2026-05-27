const TEXT_NODE = 3
const ELEMENT_NODE = 1

const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'STRONG',
  'EM',
  'U',
  'S',
  'CODE',
  'PRE',
  'BLOCKQUOTE',
  'MARK',
  'SUP',
  'SUB',
  'A',
  'UL',
  'OL',
  'LI',
  'IMG',
])
const SAFE_HREF_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const SAFE_SRC_PROTOCOLS = new Set(['http:', 'https:'])
const ALIGN_VALUES = new Set(['left', 'center', 'right', 'justify'])

function hasExplicitScheme(value: string): boolean {
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
}

function isSafeHref(href: string): boolean {
  try {
    if (!hasExplicitScheme(href)) return false
    const url = new URL(href)
    return SAFE_HREF_PROTOCOLS.has(url.protocol)
  } catch {
    return false
  }
}

function isSafeSrc(src: string): boolean {
  if (src.startsWith('data:image/')) return true
  try {
    if (!hasExplicitScheme(src)) return false
    const url = new URL(src)
    return SAFE_SRC_PROTOCOLS.has(url.protocol)
  } catch {
    return false
  }
}

function parseRichTextInput(input: string): Document {
  if (typeof window !== 'undefined') {
    return new DOMParser().parseFromString(input, 'text/html')
  }
  const { DOMParser: LinkedomDOMParser } = require('linkedom') as typeof import('linkedom')
  return new LinkedomDOMParser().parseFromString(
    `<!DOCTYPE html><html><head></head><body>${input}</body></html>`,
    'text/html',
  ) as unknown as Document
}

function createSanitizeOutputDocument(): Document {
  if (typeof window !== 'undefined') {
    return document.implementation.createHTMLDocument('sanitized')
  }
  const { parseHTML } = require('linkedom') as typeof import('linkedom')
  const { document: linkedomDoc } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>')
  return linkedomDoc as unknown as Document
}

function preserveEmptyParagraphs(html: string): string {
  return html.replace(/<p([^>]*)>\s*<\/p>/gi, '<p$1><br></p>')
}

function blockTagName(tag: string): string | null {
  if (tag === 'DIV') return 'p'
  if (ALLOWED_TAGS.has(tag)) return tag.toLowerCase()
  return null
}

function sanitizeNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === TEXT_NODE) return doc.createTextNode(node.textContent ?? '')
  if (node.nodeType !== ELEMENT_NODE) return null

  const el = node as HTMLElement
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
      cleanEl.setAttribute('style', `text-align:${align}`)
    }
  }

  Array.from(el.childNodes).forEach((child) => {
    const clean = sanitizeNode(child, doc)
    if (clean) cleanEl.appendChild(clean)
  })

  return cleanEl
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function sanitizeRichTextHtml(input: string): string {
  if (!input.trim()) return ''

  const parsed = parseRichTextInput(input)
  const out = createSanitizeOutputDocument()

  Array.from(parsed.body.childNodes).forEach((child) => {
    const clean = sanitizeNode(child, out)
    if (clean) out.body.appendChild(clean)
  })

  return preserveEmptyParagraphs(out.body.innerHTML)
}

export function normalizePlainDescriptionToHtml(input: string): string {
  const trimmed = input.trim()
  return trimmed ? `<p>${escapeHtml(trimmed)}</p>` : ''
}

/** Plain text for SSR / pre-hydration fallback (no HTML). */
export function richTextPlainText(input: string): string {
  const raw = (input ?? '').trim()
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

/** True when HTML has no visible text (e.g. `<p></p>`, `<p><br></p>`). */
export function isRichTextHtmlEmpty(input: string): boolean {
  const raw = (input ?? '').trim()
  if (!raw) return true
  if (/<img\b/i.test(raw)) return false
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return !text
}

/** Normalize legacy plain text, then sanitize for read-only display. */
export function prepareRichTextHtmlForDisplay(input: string): string {
  const raw = (input ?? '').trim()
  if (!raw || isRichTextHtmlEmpty(raw)) return ''
  const hasHtmlElements = /<\s*\/?[a-z][^>]*>/i.test(raw)
  const source = hasHtmlElements ? raw : normalizePlainDescriptionToHtml(raw)
  const sanitized = sanitizeRichTextHtml(source)
  return isRichTextHtmlEmpty(sanitized) ? '' : sanitized
}
