import Link from 'next/link'
import { UserMenu } from './user-menu'

interface DashboardNavProps {
  userInitials: string
  userImage?: string | null
  userName?: string | null
  userEmail?: string | null
}

export function DashboardNav({ userInitials, userImage, userName, userEmail }: DashboardNavProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--background)]">
      <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-[14px]">
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
          <UserMenu
            userInitials={userInitials}
            userImage={userImage}
            userName={userName}
            userEmail={userEmail}
          />
        </nav>
      </div>
    </header>
  )
}
