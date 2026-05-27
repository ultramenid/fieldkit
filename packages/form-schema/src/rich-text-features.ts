import { z } from 'zod'

export const richTextFeaturesSchema = z.object({
  lists: z.boolean(),
  blockquote: z.boolean(),
  codeBlock: z.boolean(),
  bold: z.boolean(),
  italic: z.boolean(),
  underline: z.boolean(),
  highlight: z.boolean(),
  link: z.boolean(),
  align: z.boolean(),
  image: z.boolean(),
})

export type RichTextFeatures = z.infer<typeof richTextFeaturesSchema>

/** Full toolbar — form description editor */
export const FORM_DESCRIPTION_RICH_TEXT_FEATURES: RichTextFeatures = {
  lists: true,
  blockquote: true,
  codeBlock: true,
  bold: true,
  italic: true,
  underline: true,
  highlight: true,
  link: true,
  align: true,
  image: true,
}

/** Default for new rich text fields in the form builder */
export const DEFAULT_FIELD_RICH_TEXT_FEATURES: RichTextFeatures = {
  lists: true,
  blockquote: true,
  codeBlock: false,
  bold: true,
  italic: true,
  underline: true,
  highlight: false,
  link: true,
  align: true,
  image: true,
}

const partialRichTextFeaturesSchema = richTextFeaturesSchema.partial()

export function resolveRichTextFeatures(
  partial: z.infer<typeof partialRichTextFeaturesSchema> | undefined,
  base: RichTextFeatures = DEFAULT_FIELD_RICH_TEXT_FEATURES,
): RichTextFeatures {
  return { ...base, ...partial }
}

export const RICH_TEXT_FEATURE_OPTIONS: { key: keyof RichTextFeatures; label: string }[] = [
  { key: 'bold', label: 'Bold' },
  { key: 'italic', label: 'Italic' },
  { key: 'underline', label: 'Underline' },
  { key: 'highlight', label: 'Highlight' },
  { key: 'lists', label: 'Lists' },
  { key: 'blockquote', label: 'Blockquote' },
  { key: 'codeBlock', label: 'Code block' },
  { key: 'link', label: 'Link' },
  { key: 'align', label: 'Alignment' },
  { key: 'image', label: 'Image' },
]
