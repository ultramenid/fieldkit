import Link from 'next/link'
import { auth } from '@/lib/auth'

export async function Nav() {
  const session = await auth()
  const isLoggedIn = !!session?.user?.id

  return (
    <header className="border-b border-[var(--border)]">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-[14px]">
        <Link href="/" className="flex items-center gap-2.5 font-sans text-[22px] font-medium tracking-tight text-[var(--foreground)]">
          <img src="/logo.png" alt="FieldKit" className="h-7 w-7" />
          FieldKit
        </Link>
        <nav className="flex gap-5">
          <Link
            href="/docs"
            className="rounded-full border border-[var(--border)] px-[14px] py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
          >
            Docs
          </Link>
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="rounded-full border border-[var(--foreground)] bg-[var(--foreground)] px-[14px] py-1.5 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-80"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="rounded-full border border-[var(--border)] px-[14px] py-1.5 text-sm text-[var(--muted)] transition-colors hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
