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

  return NextResponse.next()
})

export const config = {
  matcher: ['/dashboard/:path*', '/forms/:path*', '/auth/:path*'],
}
