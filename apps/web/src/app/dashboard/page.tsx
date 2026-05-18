import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'

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

  type FormWithCount = (typeof forms)[number]
  const totalResponses = forms.reduce((sum: number, f: FormWithCount) => sum + f._count.responses, 0)
  const publishedCount = forms.filter((f: FormWithCount) => f.published).length

  const formData = forms.map((f: FormWithCount) => ({
    id: f.id,
    title: f.title,
    description: f.description,
    published: f.published ?? false,
    closed: f.closed ?? false,
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
        <DashboardStats
          initialTotalForms={forms.length}
          initialTotalResponses={totalResponses}
          initialPublishedCount={publishedCount}
          initialForms={formData}
        />
      </main>
    </div>
  )
}
