import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

// Lightweight config for middleware — no Prisma adapter (Edge-compatible)
export const { auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [Google],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    authorized({ auth }) {
      return !!auth?.user
    },
  },
})
