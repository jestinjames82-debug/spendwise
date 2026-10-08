import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { createHash } from "node:crypto"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(200) }).safeParse(credentials)
        if (!parsed.success) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: { OR: [{ email: parsed.data.email.toLowerCase() }, { email: parsed.data.email }] }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          parsed.data.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      if (typeof token.id !== "string") return null
      const currentUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: { password: true, name: true, email: true },
      })
      if (!currentUser?.password) return null
      const passwordVersion = createHash("sha256").update(currentUser.password).digest("hex")
      if (user) token.passwordVersion = passwordVersion
      // A password reset invalidates existing sessions on their next request.
      if (token.passwordVersion !== passwordVersion) return null
      token.name = currentUser.name
      token.email = currentUser.email
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  }
})
