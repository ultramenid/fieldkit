import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { DEV_USER_ID } from '@/lib/dev-auth'
import { BuilderShell } from '@/components/builder/builder-shell'
import type { BuilderState } from '@/lib/builder-types'
import type { BuilderField } from '@/lib/builder-types'

export default async function FormBuilderPage({
  params,
}: {
  params: { id: string }
}) {
  const form = await db.form.findFirst({
    where: { id: params.id, userId: DEV_USER_ID },
  })

  if (!form) notFound()

  const schema = form.schema as {
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
  }

  return <BuilderShell initialState={initialState} />
}
