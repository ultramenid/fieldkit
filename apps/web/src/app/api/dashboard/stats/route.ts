import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const forms = await db.form.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { responses: true } } },
  })

  const totalForms = forms.length
  const totalResponses = forms.reduce((sum, f) => sum + f._count.responses, 0)
  const publishedCount = forms.filter((f) => (f as { published?: boolean }).published).length

  return NextResponse.json({ totalForms, totalResponses, publishedCount })
}
