import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
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
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
