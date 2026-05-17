import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export default async function NewFormPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

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
  redirect(`/forms/${form.id}`)
}
