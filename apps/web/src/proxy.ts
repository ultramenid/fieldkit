import { auth } from '@/lib/auth-edge'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user

  // Redirect logged-in users away from auth pages to dashboard
  if (isLoggedIn && pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect dashboard and form routes — redirect to sign in
  if (!isLoggedIn && (pathname.startsWith('/dashboard') || pathname.startsWith('/forms'))) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  return response
})

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/forms/:path*',
    '/auth/signin',
    '/api/:path*',
    '/f/:path*',
  ],
}
