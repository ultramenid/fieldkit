import Link from 'next/link'

export function DashboardNav({
  userInitials,
  maxWidth = '960px',
}: {
  userInitials: string
  maxWidth?: string
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]">
      <div className={`mx-auto flex items-center justify-between px-6 py-[14px]`} style={{ maxWidth }}>
        <Link href="/" className="font-sans text-[20px] font-medium text-[var(--foreground)] no-underline">
          FieldKit
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-[14px] font-medium text-[var(--foreground)] no-underline">
            Forms
          </Link>
          <Link href="/docs" className="text-[14px] text-[var(--muted)] no-underline hover:text-[var(--foreground)]">
            Docs
          </Link>
          <div className="grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[13px] font-medium text-[var(--muted)]">
            {userInitials}
          </div>
        </nav>
      </div>
    </header>
  )
}
