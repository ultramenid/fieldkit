import { Sidebar } from '@/components/docs/sidebar'
import { DocsContent } from '@/components/docs/content'
import { BackToTop } from '@/components/docs/back-to-top'

export const metadata = {
  title: 'Documentation · FieldKit',
  description: 'Everything you need to build forms online and collect data offline.',
}

export default function DocsPage() {
  return (
    <div className="flex min-h-dvh bg-[var(--background)]">
      <Sidebar />
      <main className="relative ml-[260px] max-w-[680px] px-12 pt-16 max-md:ml-0 max-md:px-5 max-md:py-8" style={{ paddingBottom: 100 }}>
        <DocsContent />
      </main>
      <BackToTop />
    </div>
  )
}
