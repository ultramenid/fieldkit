import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { FormView } from '@/components/form-view/form-view'
import type { BuilderField } from '@/lib/builder-types'

export default async function PublicFormPage({
  params,
}: {
  params: { id: string }
}) {
  const form = await db.form.findFirst({
    where: { id: params.id, published: true },
  })
  if (!form) notFound()

  const schema = form.schema as unknown as {
    fields: BuilderField[]
    settings: { submitButtonText?: string; confirmationMessage?: string }
  }

  const isClosed = (form as { closed?: boolean }).closed ?? false

  return (
    <div className="min-h-dvh bg-[var(--surface)]">
      <header className="border-b border-[var(--border)] bg-[var(--bg)] px-6 py-4">
        <div className="mx-auto flex max-w-[960px] items-center justify-between">
          <span className="font-sans text-[15px] font-medium text-[var(--muted)]">FieldKit</span>
          <span className={`flex items-center gap-1.5 font-mono text-[12px] ${isClosed ? 'text-[var(--muted)]' : 'text-[#16a34a]'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isClosed ? 'bg-[var(--muted)]' : 'bg-[#22c55e]'}`} />
            {isClosed ? 'Closed' : 'Published'}
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
          isClosed={isClosed}
        />
      </main>
      <footer className="py-6 text-center text-[12px] text-[var(--muted)]">
        This form was created with <a href="/" className="text-[var(--muted)] underline">FieldKit</a> · Responses are stored securely
      </footer>
    </div>
  )
}
