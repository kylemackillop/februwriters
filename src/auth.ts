import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.username = (user as any).username
        token.timezone = (user as any).timezone
      }
      return token
    },
    async session({ session, token }) {
      session.user.id       = token.id as string
      session.user.username = token.username as string
      session.user.timezone = token.timezone as string
      return session
    },
  },
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })
        if (!user || !user.passwordHash) return null
        const valid = await compare(
          credentials.password as string,
          user.passwordHash
        )
        if (!valid) return null
        return {
          id:       user.id,
          email:    user.email,
          name:     user.name,
          username: user.username,
          timezone: user.timezone,
        }
      },
    }),
  ],
})
