import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { FormsGrid } from '@/components/dashboard/forms-grid'

export const metadata = {
  title: 'Dashboard · FieldKit',
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const user = session.user
  const initials = (user.name ?? user.email ?? 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const forms = await db.form.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: { _count: { select: { responses: true } } },
  })

  const totalResponses = forms.reduce((sum, f) => sum + f._count.responses, 0)
  const publishedCount = forms.filter((f) => (f as { published?: boolean }).published).length

  const formData = forms.map((f) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    published: (f as { published?: boolean }).published ?? false,
    closed: (f as { closed?: boolean }).closed ?? false,
    createdAt: f.createdAt.toISOString(),
    responseCount: f._count.responses,
  }))

  return (
    <div className="min-h-dvh bg-[var(--background)]">
      <DashboardNav
        userInitials={initials}
        userImage={user.image}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="mx-auto max-w-[960px] px-6">
        <div className="mb-8 grid grid-cols-3 gap-4 pt-10 max-sm:grid-cols-1">
          <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
            <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
              {forms.length}
            </div>
            <div className="mt-1 text-[13px] text-[var(--muted)]">Total forms</div>
          </div>
          <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
            <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
              {totalResponses}
            </div>
            <div className="mt-1 text-[13px] text-[var(--muted)]">Total responses</div>
          </div>
          <div className="rounded-[12px] border border-[var(--border)] px-6 py-5">
            <div className="font-mono text-[28px] font-medium tabular-nums text-[var(--foreground)]">
              {publishedCount}
            </div>
            <div className="mt-1 text-[13px] text-[var(--muted)]">Published forms</div>
          </div>
        </div>
        <FormsGrid forms={formData} />
      </main>
    </div>
  )
}
