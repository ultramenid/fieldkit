'use client'

import { useEffect, useMemo, useState } from 'react'
import { richTextPlainText } from '@/lib/sanitize-rich-text'
import { prepareRichTextHtmlForDisplayDom } from '@/lib/sanitize-rich-text-dom'

export const RICH_TEXT_PROSE_CLASS =
  'text-[15px] leading-relaxed text-[var(--muted)] [&_p]:my-0 [&_p]:min-h-[1.5em] [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:italic [&_pre]:overflow-x-auto [&_pre]:rounded-[8px] [&_pre]:bg-[var(--surface)] [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[13px] [&_code]:rounded-[4px] [&_code]:bg-[var(--surface)] [&_code]:px-1 [&_code]:font-mono [&_code]:text-[13px] [&_mark]:bg-[color:rgba(139,69,19,0.18)] [&_sup]:align-super [&_sup]:text-[11px] [&_sub]:align-sub [&_sub]:text-[11px] [&_a]:underline [&_a]:underline-offset-2 [&_img]:my-2 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[10px]'

interface RichTextDisplayProps {
  html: string
  className?: string
  /** Shown in builder preview when the block has no content yet. */
  emptyHint?: string
}

/**
 * Read-only rich text for preview / published forms (no TipTap toolbar).
 */
export function RichTextDisplay({ html, className = '', emptyHint }: RichTextDisplayProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const plain = useMemo(() => richTextPlainText(html), [html])
  const safeHtml = useMemo(() => {
    if (!mounted) return ''
    return prepareRichTextHtmlForDisplayDom(html)
  }, [html, mounted])

  const classNames = `${RICH_TEXT_PROSE_CLASS} ${className}`.trim()

  if (safeHtml) {
    return (
      <div
        className={classNames}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    )
  }

  if (plain) {
    return <div className={classNames}>{plain}</div>
  }

  if (emptyHint) {
    return (
      <p className="text-[13px] italic text-[var(--muted)]">{emptyHint}</p>
    )
  }

  return null
}
