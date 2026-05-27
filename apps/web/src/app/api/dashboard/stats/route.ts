import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { unauthorized, withApiErrorHandling } from '@/lib/api-errors'

export const dynamic = 'force-dynamic'

export const GET = withApiErrorHandling('dashboard:stats', async function GET() {
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const forms = await db.form.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { responses: true } } },
  })

  const totalForms = forms.length
  type FormWithCount = (typeof forms)[number]
  const totalResponses = forms.reduce((sum: number, f: FormWithCount) => sum + f._count.responses, 0)
  const publishedCount = forms.filter((f: FormWithCount) => f.published).length
  const formResponseCounts: Record<string, number> = {}
  forms.forEach((f: FormWithCount) => { formResponseCounts[f.id] = f._count.responses })

  return NextResponse.json({ totalForms, totalResponses, publishedCount, formResponseCounts })
})
