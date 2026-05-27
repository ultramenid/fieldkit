import type { Metadata } from 'next'
import { DocsSidebar } from '@/components/docs/sidebar'

export const metadata: Metadata = {
  title: 'Documentation · FieldKit',
  description: 'FieldKit documentation for offline form collection',
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <DocsSidebar />
      <main className="flex-1 px-6 py-12 lg:px-16">
        {children}
      </main>
    </div>
  )
}
