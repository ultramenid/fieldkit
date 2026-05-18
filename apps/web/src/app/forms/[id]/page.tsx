import { notFound, redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { BuilderShell } from '@/components/builder/builder-shell'
import type { BuilderState, BuilderField } from '@/lib/builder-types'

export default async function FormBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/signin')

  const form = await db.form.findFirst({
    where: { id: id, userId: session.user.id },
  })

  if (!form) notFound()

  const schema = form.schema as unknown as {
    fields: BuilderField[]
    settings: Record<string, unknown>
  }

  const initialState: BuilderState = {
    formId: form.id,
    title: form.title,
    description: form.description,
    fields: schema.fields ?? [],
    selectedId: null,
    isDirty: false,
    isSaving: false,
    isPublished: (form as { published?: boolean }).published ?? false,
    isClosed: (form as { closed?: boolean }).closed ?? false,
    allowMultipleSubmissions: (schema.settings?.allowMultipleSubmissions as boolean) ?? false,
  }

  return <BuilderShell initialState={initialState} />
}
