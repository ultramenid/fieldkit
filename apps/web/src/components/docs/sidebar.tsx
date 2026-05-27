'use client'

import { useState } from 'react'
import Link from 'next/link'

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'quickstart', title: 'Quick Start' },
  { id: 'installation', title: 'Installation' },
  { id: 'web-setup', title: 'Web Setup' },
  { id: 'local-server', title: 'Local Server' },
  { id: 'mobile-app', title: 'Mobile App' },
  { id: 'api-reference', title: 'API Reference' },
]

export function DocsSidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg border border-gray-200 bg-white p-2 shadow-sm lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="border-b border-gray-100 p-6">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-black">
              <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              FieldKit
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Documentation
            </div>
            <div className="space-y-0.5">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
                  onClick={() => setIsOpen(false)}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
