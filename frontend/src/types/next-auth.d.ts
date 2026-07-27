import { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      id: string
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    accessToken?: string
    role: string
    id: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    role: string
    id: string
  }
}
