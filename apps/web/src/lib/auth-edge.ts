import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

// Lightweight config for middleware — no Prisma adapter (Edge-compatible)
export const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [Google],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user
    },
  },
})
