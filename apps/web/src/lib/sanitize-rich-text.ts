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

function sanitizeNode(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? '')
  if (node.nodeType !== Node.ELEMENT_NODE) return null

  const el = node as HTMLElement
  if (!ALLOWED_TAGS.has(el.tagName)) {
    if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return null

    const fragment = doc.createDocumentFragment()
    Array.from(el.childNodes).forEach((child) => {
      const clean = sanitizeNode(child, doc)
      if (clean) fragment.appendChild(clean)
    })
    return fragment
  }

  const cleanEl = doc.createElement(el.tagName.toLowerCase())

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

  if (typeof window === 'undefined') {
    const plain = input
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return plain ? `<p>${escapeHtml(plain)}</p>` : ''
  }

  const parser = new DOMParser()
  const parsed = parser.parseFromString(input, 'text/html')
  const out = document.implementation.createHTMLDocument('sanitized')

  Array.from(parsed.body.childNodes).forEach((child) => {
    const clean = sanitizeNode(child, out)
    if (clean) out.body.appendChild(clean)
  })

  return out.body.innerHTML
}

export function normalizePlainDescriptionToHtml(input: string): string {
  const trimmed = input.trim()
  return trimmed ? `<p>${escapeHtml(trimmed)}</p>` : ''
}
