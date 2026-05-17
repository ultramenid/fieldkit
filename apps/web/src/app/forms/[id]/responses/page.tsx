import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { ResponsesTable } from '@/components/responses/responses-table'
import type { BuilderField } from '@/lib/builder-types'

export default async function ResponsesPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const form = await db.form.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { _count: { select: { responses: true } } },
  })
  if (!form) notFound()

  const responses = await db.response.findMany({
    where: { formId: params.id },
    orderBy: { submittedAt: 'desc' },
  })

  const schema = form.schema as unknown as { fields: BuilderField[] }
  const fields = (schema.fields ?? []).map((f) => ({ id: f.id, label: f.label, type: f.type }))

  const initials = (session.user.name ?? session.user.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const serializedResponses = responses.map((r) => ({
    id: r.id,
    submissionId: r.submissionId,
    source: r.source,
    submittedAt: r.submittedAt.toISOString(),
    data: r.data as Record<string, unknown>,
  }))

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <DashboardNav userInitials={initials} />
      <main className="mx-auto max-w-[960px] px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 pt-6 text-[13px] text-[var(--muted)]">
          <Link href="/dashboard" className="hover:text-[var(--foreground)] no-underline text-[var(--muted)]">
            Forms
          </Link>
          <span>/</span>
          <Link href={`/forms/${form.id}`} className="hover:text-[var(--foreground)] no-underline text-[var(--muted)]">
            {form.title}
          </Link>
          <span>/</span>
          <span className="text-[var(--foreground)]">Responses</span>
        </div>

        <ResponsesTable
          formId={form.id}
          formTitle={form.title}
          fields={fields}
          initialResponses={serializedResponses}
          published={form.published}
          closed={form.closed}
        />
      </main>
    </div>
  )
}
