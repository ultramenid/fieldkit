import { Nav } from '@/components/landing/nav'
import { Sidebar } from '@/components/docs/sidebar'
import { DocsContent } from '@/components/docs/content'

export const metadata = {
  title: 'Documentation · FieldKit',
  description: 'Everything you need to build forms online and collect data offline.',
}

export default function DocsPage() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <Nav />
      <div className="mx-auto grid w-full max-w-[960px] flex-1 grid-cols-[220px_1fr] overflow-hidden max-md:grid-cols-1">
        <Sidebar />
        <div id="docs-content-scroll" className="overflow-y-auto">
          <DocsContent />
        </div>
      </div>
    </div>
  )
}
