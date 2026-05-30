import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user || !(user as any).password) {
          return null
        }
        
        const passwordMatch = await bcrypt.compare(credentials.password, (user as any).password)
        
        if (passwordMatch) {
          return { id: user.id, email: user.email, name: user.name }
        }
        
        return null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
