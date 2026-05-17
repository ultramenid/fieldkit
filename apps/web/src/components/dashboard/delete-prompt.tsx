'use client'

interface DeletePromptProps {
  formTitle: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function DeletePrompt({ formTitle, onConfirm, onCancel, loading }: DeletePromptProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="w-full max-w-[400px] rounded-[12px] border border-[var(--border)] bg-[var(--background)] p-8">
        <h3 className="mb-2 font-sans text-[20px] font-medium text-[var(--foreground)]">
          Delete form?
        </h3>
        <p className="mb-6 text-[14px] text-[var(--muted)]">
          <strong className="text-[var(--foreground)]">&ldquo;{formTitle}&rdquo;</strong> and all its
          responses will be permanently deleted. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-full border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-[14px] font-medium text-[var(--foreground)] transition-colors hover:border-[var(--foreground)] disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 rounded-full border border-[#dc2626] bg-[#dc2626] px-4 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
