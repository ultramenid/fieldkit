import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DEV_USER_ID } from '@/lib/dev-auth'

export async function POST() {
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
      userId: DEV_USER_ID,
    },
  })
  return NextResponse.json({ id: form.id })
}
