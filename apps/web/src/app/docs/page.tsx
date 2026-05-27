import type { Metadata } from 'next'
import { Nav } from '@/components/landing/nav'
import { DocsSidebar } from '@/components/docs/docs-sidebar'

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'install', title: 'Install' },
  { id: 'web-setup', title: 'Web setup' },
  { id: 'local-server', title: 'Local server' },
  { id: 'mobile-workflow', title: 'Mobile workflow' },
  { id: 'sync-import', title: 'Sync and import' },
  { id: 'api-reference', title: 'API reference' },
]

export const metadata: Metadata = {
  title: 'Docs · FieldKit',
  description: 'FieldKit setup, offline collection, sync, and API documentation',
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="overflow-x-auto rounded-[12px] border border-[var(--border)] bg-[#f7f7f7] p-4 font-mono text-[13px] leading-6 text-[var(--foreground)]">
      <code>{children}</code>
    </pre>
  )
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-[var(--border)] pt-10 first:border-t-0 first:pt-0">
      <h2 className="mb-4 font-sans text-[30px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
        {title}
      </h2>
      <div className="space-y-5 text-[15px] leading-7 text-[var(--muted)]">{children}</div>
    </section>
  )
}

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <Nav />
      <main className="mx-auto grid w-full max-w-[1100px] gap-8 px-4 py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12 lg:px-6 lg:py-12">
        <DocsSidebar sections={sections} />

        <article className="min-w-0">
          <header className="mb-10 max-w-[640px] lg:mb-14">
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
              FieldKit Documentation
            </p>
            <h1 className="mb-4 font-sans text-[36px] font-semibold leading-[1.1] tracking-tight text-[var(--foreground)] sm:text-[44px] lg:text-[52px]">
              Collect data anywhere, sync when ready.
            </h1>
            <p className="max-w-[560px] text-[15px] leading-relaxed text-[var(--muted)] lg:text-[16px]">
              FieldKit combines a hosted web app, mobile offline collection, and a LAN local server for field teams working with unreliable connectivity.
            </p>
          </header>

          <div className="space-y-12 lg:space-y-16">
            <Section id="overview" title="Overview">
              <p>
                FieldKit is built around one source of truth: the web app. Teams design and publish forms on the server, then export configurations to offline clients for collection in the field.
              </p>
              <p>
                Data flow is intentionally one-way. Form configurations move from the web app to mobile devices or local servers. Responses move back from offline clients to the web app through sync or import workflows.
              </p>
              <div className="rounded-[var(--radius-container)] border border-[var(--border)] bg-[var(--surface)] p-4 font-mono text-[13px] text-[var(--foreground)] lg:p-5">
                Web app → form config → mobile app / local server → collected responses → web app
              </div>
            </Section>

            <Section id="install" title="Install">
              <p>
                Install dependencies from the repository root, then run each package from its own workspace folder. The web app uses PostgreSQL and S3-compatible storage for production.
              </p>
              <CodeBlock>{`npm install
npm --prefix apps/web run dev`}</CodeBlock>
              <p>
                For field machines, the local server is distributed separately as an npm package and is installed globally by field staff.
              </p>
              <CodeBlock>{`npm install -g @malichamdan/fieldkit-local-server
fieldkit serve`}</CodeBlock>
            </Section>

            <Section id="web-setup" title="Web setup">
              <p>
                The web app is a Next.js application with Google OAuth, PostgreSQL, Prisma, and S3-compatible uploads. It owns form definitions, published form links, response tables, imports, exports, and mobile sync endpoints.
              </p>
              <CodeBlock>{`docker compose up postgres minio -d
npm --prefix apps/web run dev`}</CodeBlock>
              <p>
                Configure Google OAuth credentials, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, database connection, and S3-compatible storage variables before deploying production.
              </p>
            </Section>

            <Section id="local-server" title="Local server">
              <p>
                The local server runs independently on field machines. Operators import exported form configuration JSON through its web UI, collect responses on the LAN, then export response data for upload to the web app.
              </p>
              <p>
                Form definitions are never edited on the local server. This keeps offline collection simple and prevents conflicting form versions.
              </p>
              <CodeBlock>{`fieldkit serve
# Open http://localhost:3000`}</CodeBlock>
            </Section>

            <Section id="mobile-workflow" title="Mobile workflow">
              <p>
                The mobile app downloads form configurations using the form mobile secret, stores forms locally, queues responses offline, and syncs when connectivity returns.
              </p>
              <p>
                Field teams can collect multiple forms without relying on a live connection. File uploads use the mobile upload endpoint when the sync engine can reach the server.
              </p>
              <CodeBlock>{`GET /api/forms/[id]/export  # Download form config
POST /api/mobile/upload    # Upload files when online`}</CodeBlock>
            </Section>

            <Section id="sync-import" title="Sync and import">
              <p>
                Every response includes a per-form `submissionId`. The server deduplicates by `(formId, submissionId)`, so retrying a mobile sync or importing the same local server export does not create duplicate rows.
              </p>
              <p>
                Mobile responses use the mobile sync API. Local server responses are imported from exported JSON through the web interface.
              </p>
              <CodeBlock>{`POST /api/mobile/responses
POST /api/mobile/upload
GET  /api/forms/[id]/export`}</CodeBlock>
            </Section>

            <Section id="api-reference" title="API reference">
              <p>
                API route handlers validate request bodies with Zod before use. Mobile endpoints authenticate with the form mobile secret instead of user accounts.
              </p>
              <CodeBlock>{`GET  /api/forms/[id]/export
POST /api/forms/[id]/responses
POST /api/mobile/responses
POST /api/mobile/upload
GET  /api/forms/[id]/stream`}</CodeBlock>
              <p>
                Response streams use Server-Sent Events backed by PostgreSQL LISTEN/NOTIFY, allowing dashboards and response tables to update without polling.
              </p>
            </Section>
          </div>
        </article>
      </main>
    </div>
  )
}
