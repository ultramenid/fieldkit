import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { DEV_USER_ID } from '@/lib/dev-auth'

export default async function NewFormPage() {
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
  redirect(`/forms/${form.id}`)
}
