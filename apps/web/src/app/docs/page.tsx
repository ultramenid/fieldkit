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
      <style>{`
        .docs-main {
          margin-left: 260px;
          max-width: 680px;
          padding-bottom: 100px;
        }

        .docs-menu-button {
          display: none;
        }

        @media (max-width: 768px) {
          .docs-menu-button {
            display: flex;
          }

          .docs-main {
            margin-left: 0;
            max-width: none;
            width: 100%;
          }
        }
      `}</style>
      <Sidebar />
      <main className="docs-main relative px-12 pt-16 max-md:px-5 max-md:py-8">
        <DocsContent />
      </main>
      <BackToTop />
    </div>
  )
}
