'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

interface UserMenuProps {
  userInitials: string
  userImage?: string | null
  userName?: string | null
  userEmail?: string | null
}

export function UserMenu({ userInitials, userImage, userName, userEmail }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface)] text-[13px] font-medium text-[var(--muted)] transition-opacity hover:opacity-80"
      >
        {userImage ? (
          <Image src={userImage} alt={userName ?? 'User'} width={32} height={32} className="h-full w-full object-cover" />
        ) : (
          userInitials
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-[200px] rounded-[12px] border border-[var(--border)] bg-[var(--background)] py-1 shadow-lg">
          {(userName || userEmail) && (
            <div className="border-b border-[var(--border)] px-4 py-3">
              {userName && <p className="text-[13px] font-medium text-[var(--foreground)]">{userName}</p>}
              {userEmail && <p className="text-[12px] text-[var(--muted)]">{userEmail}</p>}
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-[13px] text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
