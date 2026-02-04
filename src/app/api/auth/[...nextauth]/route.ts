import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import argon2 from "argon2";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.password || typeof credentials.password !== "string") {
          return null;
        }

        // Get password hash from environment variable
        const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
        if (!hashedPassword) {
          // If no hash is set, allow any password (for initial setup)
          // In production, you should set ADMIN_PASSWORD_HASH
          return { id: "1", name: "Admin" };
        }

        try {
          const isValid = await argon2.verify(hashedPassword, credentials.password);
          if (!isValid) {
            return null;
          }
        } catch (error) {
          // If verification fails, return null
          return null;
        }

        return { id: "1", name: "Admin" };
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export const { GET, POST } = handlers;
