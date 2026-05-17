import Link from 'next/link'

export function Nav() {
  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-[14px]">
        <span className="font-sans text-[22px] font-medium tracking-tight text-[var(--foreground)]">FieldKit</span>
        <nav className="flex gap-5">
          {[
            { label: 'Docs', href: '/docs' },
            { label: 'Sign in', href: '/auth/signin' },
            { label: 'Dashboard', href: '/dashboard' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-[var(--border)] px-[14px] py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
