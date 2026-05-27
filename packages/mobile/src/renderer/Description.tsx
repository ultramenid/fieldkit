import { RichTextDisplay } from '../components/RichTextDisplay'

interface Props {
  html: string
}

export function Description({ html }: Props) {
  return <RichTextDisplay html={html} color="#737373" fontSize={15} />
}
