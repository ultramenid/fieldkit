import Link from 'next/link'

export function Nav() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex w-full max-w-[960px] items-center justify-between px-6 py-[14px]">
        <span className="font-sans text-[22px] font-medium tracking-tight">FieldKit</span>
        <nav className="flex gap-5">
          {[
            { label: 'Docs', href: '/docs' },
            { label: 'Sign in', href: '/auth/signin' },
            { label: 'Dashboard', href: '/dashboard' },
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border border-neutral-200 px-[14px] py-1.5 text-sm text-neutral-500 transition-colors hover:border-black hover:text-black"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
