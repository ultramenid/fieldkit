import { Nav } from '@/components/landing/nav'
import { Sidebar } from '@/components/docs/sidebar'
import { DocsContent } from '@/components/docs/content'

export const metadata = {
  title: 'Documentation · FieldKit',
  description: 'Everything you need to build forms online and collect data offline.',
}

export default function DocsPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <div className="mx-auto grid w-full max-w-[960px] grid-cols-[220px_1fr] max-md:grid-cols-1">
        <Sidebar />
        <DocsContent />
      </div>
    </div>
  )
}
