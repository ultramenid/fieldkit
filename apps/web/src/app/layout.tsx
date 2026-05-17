import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { Providers } from '@/components/providers'
import './globals.css'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'FieldKit',
  description: 'Offline-capable form builder for field data collection',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <NextTopLoader color="#8b4513" showSpinner={false} />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
