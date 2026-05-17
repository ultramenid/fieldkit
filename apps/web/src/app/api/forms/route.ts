import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
}
