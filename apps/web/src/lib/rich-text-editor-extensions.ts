import Highlight from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import type { Extensions } from '@tiptap/react'
import type { RichTextFeatures } from '@fieldkit/form-schema'

export function buildRichTextExtensions(
  features: RichTextFeatures,
  placeholder: string,
): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      heading: false,
      horizontalRule: false,
      bold: features.bold ? {} : false,
      italic: features.italic ? {} : false,
      blockquote: features.blockquote ? {} : false,
      codeBlock: features.codeBlock ? {} : false,
      bulletList: features.lists ? {} : false,
      orderedList: features.lists ? {} : false,
    }),
    Placeholder.configure({ placeholder }),
  ]

  if (features.link) {
    extensions.push(
      Link.configure({
        openOnClick: false,
        autolink: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
    )
  }
  if (features.underline) extensions.push(Underline)
  if (features.highlight) extensions.push(Highlight)
  if (features.image) extensions.push(Image.configure({ inline: false }))
  if (features.align) {
    extensions.push(TextAlign.configure({ types: ['paragraph', 'heading'] }))
  }

  return extensions
}
