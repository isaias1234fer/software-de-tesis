import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciales faltantes');
          return null;
        }

        try {
          console.log('🔍 Intentando login con:', credentials.email);
          
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            }),
            headers: { "Content-Type": "application/json" }
          });

          const data = await res.json();
          console.log('📦 Respuesta del backend:', data);

          if (res.ok && data.access_token && data.user) {
            // ✅ Devuelve SOLO los datos del usuario en el formato que NextAuth espera
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              accessToken: data.access_token,  // Guardamos el token para el callback
            };
          }
          
          console.log('❌ Login fallido:', data);
          return null;
        } catch (error) {
          console.error('❌ Error en authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Al primer login, user contiene los datos que devolvimos en authorize
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.id = (user as any).id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Transferimos los datos del token a la sesión
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};