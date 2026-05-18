import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { FormView } from '@/components/form-view/form-view'
import type { BuilderField } from '@/lib/builder-types'

export default async function PreviewPage({
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
    settings: { submitButtonText?: string; confirmationMessage?: string }
  }

  return (
    <div className="min-h-dvh bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4">
        <div className="mx-auto flex max-w-[960px] items-center justify-between">
          <span className="font-sans text-[15px] font-medium text-[var(--muted)]">FieldKit</span>
          <span className="flex items-center gap-1.5 font-mono text-[12px] text-[var(--muted)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)]" />
            Preview
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-[540px] px-6 py-12">
        <FormView
          formId={form.id}
          title={form.title}
          description={form.description}
          fields={schema.fields ?? []}
          submitButtonText={schema.settings?.submitButtonText}
          confirmationMessage={schema.settings?.confirmationMessage}
          isPreview
        />
      </main>
      <footer className="py-6 text-center text-[12px] text-[var(--muted)]">
        This form was created with FieldKit · Responses are stored securely
      </footer>
    </div>
  )
}
