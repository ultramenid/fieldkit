import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Documentation · FieldKit',
  description: 'Guide to building forms online and collecting responses offline with FieldKit.',
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
