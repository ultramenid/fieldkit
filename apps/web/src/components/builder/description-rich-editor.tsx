'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { sanitizeRichTextHtml } from '@/lib/sanitize-rich-text'

type TipTapEditor = NonNullable<ReturnType<typeof useEditor>>

interface DescriptionRichEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

const MAX_IMAGE_SIZE = 20 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

let instanceIdCounter = 0

export function DescriptionRichEditor({
  value,
  onChange,
  placeholder = 'Add a form description…',
}: DescriptionRichEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const mountedRef = useRef(false)
  const instanceKey = useRef(`tiptap-${++instanceIdCounter}`)

  const extensions = useMemo(() => [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
    }),
    Link.configure({
      openOnClick: false,
      autolink: false,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    Underline,
    Highlight,
    Image.configure({ inline: false }),
    Placeholder.configure({
      placeholder,
    }),
    TextAlign.configure({ types: ['paragraph', 'heading'] }),
  ], [placeholder])

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions,
      content: value.trim() ? sanitizeRichTextHtml(value) : '<p></p>',
      onUpdate: ({ editor }: { editor: TipTapEditor }) => {
        onChange(sanitizeRichTextHtml(editor.getHTML()))
      },
      onCreate: () => {
        mountedRef.current = true
      },
      onDestroy: () => {
        mountedRef.current = false
      },
    },
    [instanceKey.current]
  )

  useEffect(() => {
    if (!editor) return

    const next = value.trim() ? sanitizeRichTextHtml(value) : '<p></p>'
    const current = sanitizeRichTextHtml(editor.getHTML()) || '<p></p>'

    if (!editor.isFocused && current !== next) {
      editor.commands.setContent(next)
    }
  }, [editor, value])

  if (!editor) return null
  const activeEditor = editor

  async function uploadAndInsertImage(file: File) {
    setUploadError(null)

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('Unsupported image type')
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError('Image too large (max 20MB)')
      return
    }

    setUploadingImage(true)

    try {
      const metaRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      })

      let meta: {
        uploadUrl?: string
        fileUrl?: string
        error?: string
      } = {}

      const contentType = metaRes.headers.get('content-type') ?? ''
      if (contentType.includes('application/json')) {
        try {
          meta = await metaRes.json() as {
            uploadUrl?: string
            fileUrl?: string
            error?: string
          }
        } catch {
          meta = { error: 'Upload failed' }
        }
      } else {
        const text = await metaRes.text()
        meta = { error: text || 'Upload failed' }
      }

      if (!metaRes.ok || !meta.uploadUrl || !meta.fileUrl) {
        throw new Error(meta.error ?? 'Upload failed')
      }

      const putRes = await fetch(meta.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!putRes.ok) {
        throw new Error('Upload failed')
      }

      activeEditor.chain().focus().setImage({ src: meta.fileUrl, alt: file.name }).run()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
    }
  }

  function addLink() {
    const prev = activeEditor.getAttributes('link').href as string | undefined
    const href = window.prompt('Enter URL', prev ?? 'https://')
    if (href === null) return

    const trimmed = href.trim()
    if (!trimmed) {
      activeEditor.chain().focus().unsetLink().run()
      return
    }

    if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)) return

    try {
      const parsed = new URL(trimmed)
      if (!['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) return

      const selection = activeEditor.state.selection
      if (selection.empty) {
        activeEditor
          .chain()
          .focus()
          .insertContent({
            type: 'text',
            text: parsed.href,
            marks: [{ type: 'link', attrs: { href: parsed.href } }],
          })
          .run()
        return
      }

      activeEditor.chain().focus().extendMarkRange('link').setLink({ href: parsed.href }).run()
    } catch {
      return
    }
  }

  function onListChange(value: string) {
    if (value === 'bullet') activeEditor.chain().focus().toggleBulletList().run()
    if (value === 'ordered') activeEditor.chain().focus().toggleOrderedList().run()
  }

  function onAlignChange(value: string) {
    activeEditor
      .chain()
      .focus()
      .setTextAlign(value as 'left' | 'center' | 'right' | 'justify')
      .run()
  }

  const listValue = activeEditor.isActive('bulletList')
    ? 'bullet'
    : activeEditor.isActive('orderedList')
      ? 'ordered'
      : ''

  const alignValue = activeEditor.isActive({ textAlign: 'center' })
    ? 'center'
    : activeEditor.isActive({ textAlign: 'right' })
      ? 'right'
      : activeEditor.isActive({ textAlign: 'justify' })
        ? 'justify'
        : 'left'

  const buttonClass = 'inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] disabled:opacity-40 disabled:hover:border-[var(--border)]'

  return (
    <div
      className="group relative -ml-2 rounded-[6px] border border-transparent px-2 py-1 transition-colors hover:border-[var(--border)] hover:bg-[var(--background)] focus-within:border-[var(--foreground)] focus-within:bg-[var(--background)]"
    >
      <div className="mb-2 hidden flex-wrap items-center gap-1 group-focus-within:flex">
        <div className="relative">
          <select
            aria-label="List type"
            className="h-6 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 pr-6 text-[11px] text-[var(--foreground)] appearance-none"
            value={listValue}
            onChange={(e) => onListChange(e.target.value)}
          >
            <option value="">List</option>
            <option value="bullet">• List</option>
            <option value="ordered">1. List</option>
          </select>
          <svg className="pointer-events-none absolute right-1.5 top-1/2 -mt-1.5 h-3 w-3 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>

        <button type="button" aria-label="Blockquote" title="Blockquote" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleBlockquote().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 7H6a2 2 0 0 0-2 2v4h4v4H4m16-10h-4a2 2 0 0 0-2 2v4h4v4h-4" /></svg>
        </button>
        <button type="button" aria-label="Code block" title="Code block" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleCodeBlock().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 18-6-6 6-6M16 6l6 6-6 6" /></svg>
        </button>
        <button type="button" aria-label="Bold" title="Bold" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleBold().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 5h6a4 4 0 0 1 0 8H7z" /><path d="M7 13h7a4 4 0 0 1 0 8H7z" /></svg>
        </button>
        <button type="button" aria-label="Italic" title="Italic" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleItalic().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4h-6" /><path d="M10 20h6" /><path d="M14 4L10 20" /></svg>
        </button>
        <button type="button" aria-label="Underline" title="Underline" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleUnderline().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4v6a6 6 0 0 0 12 0V4" /><path d="M4 20h16" /></svg>
        </button>
        <button type="button" aria-label="Highlight" title="Highlight" onMouseDown={(e) => { e.preventDefault(); activeEditor.chain().focus().toggleHighlight().run() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 11 6 6" /><path d="m14 6 4 4-9 9H5v-4z" /></svg>
        </button>
        <button type="button" aria-label="Link" title="Link" onMouseDown={(e) => { e.preventDefault(); addLink() }} className={buttonClass}>
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 1 0-7.07-7.07L10 5" /><path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.41a5 5 0 1 0 7.07 7.07L14 19" /></svg>
        </button>

        <div className="relative">
          <select
            aria-label="Text alignment"
            className="h-6 rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 pr-6 text-[11px] text-[var(--foreground)] appearance-none"
            value={alignValue}
            onChange={(e) => onAlignChange(e.target.value)}
          >
            <option value="left">Align</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
          <svg className="pointer-events-none absolute right-1.5 top-1/2 -mt-1.5 h-3 w-3 text-[var(--muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
        </div>

        <button
          type="button"
          aria-label="Insert image"
          title="Insert image"
          className={buttonClass}
          disabled={uploadingImage}
          onMouseDown={(e) => {
            e.preventDefault()
            activeEditor.chain().focus().run()
            fileInputRef.current?.click()
          }}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void uploadAndInsertImage(file)
          e.currentTarget.value = ''
        }}
      />

      <div key={instanceKey.current}>
        <EditorContent
          editor={activeEditor}
          className="min-h-[42px] cursor-text text-[14px] text-[var(--muted)] [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:h-0 [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-[var(--muted)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:opacity-60 [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:my-1 [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:underline-offset-2 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-[var(--border)] [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-[8px] [&_.ProseMirror_pre]:bg-[var(--surface)] [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-[13px] [&_.ProseMirror_code]:rounded-[4px] [&_.ProseMirror_code]:bg-[var(--surface)] [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[13px] [&_.ProseMirror_mark]:bg-[color:rgba(139,69,19,0.18)] [&_.ProseMirror_img]:my-2 [&_.ProseMirror_img]:h-auto [&_.ProseMirror_img]:max-w-full [&_.ProseMirror_img]:rounded-[10px]"
          onClick={() => activeEditor.chain().focus().run()}
        />
      </div>

      {uploadingImage && <p className="mt-1 text-[12px] text-[var(--muted)]">Uploading image…</p>}
      {uploadError && <p className="mt-1 text-[12px] text-[#dc2626]">{uploadError}</p>}
    </div>
  )
}
