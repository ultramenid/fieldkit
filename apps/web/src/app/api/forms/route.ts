import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { unauthorized, withApiErrorHandling } from '@/lib/api-errors'

export const POST = withApiErrorHandling('forms:create', async function POST(_req: Request) {
  const session = await auth()
  if (!session?.user?.id) throw unauthorized()

  const form = await db.form.create({
    data: {
      title: 'Untitled form',
      description: '',
      schema: {
        fields: [],
        settings: {
          submitButtonText: 'Submit',
          confirmationMessage: 'Thank you for your response.',
          allowMultipleSubmissions: false,
        },
      },
      userId: session.user.id,
    },
  })
  return NextResponse.json({ id: form.id })
})
