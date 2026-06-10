import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import crypto from "crypto";

import { createUserInAirtable } from "../../../../lib/airtable";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email?.toString();
        const password = credentials?.password?.toString();

        if (!email || !password) return null;

        return {
          id: crypto.createHash("md5").update(email).digest("hex"),
          name: email.split("@")[0],
          email,
          image: "",
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        if (!user?.email) return true;

        console.log("🔥 signIn callback triggered for:", user.email);

        const stableId =
          user.id ||
          crypto.createHash("md5").update(user.email).digest("hex");

        await createUserInAirtable({
          id: stableId,
          name: user.name || "No Name",
          email: user.email,
          image: user.image || "",
        });

        return true;
      } catch (err) {
        console.error("❌ Airtable signIn error:", err);
        // Still allow sign in even if Airtable fails
        return true;
      }
    },

    // ✅ FIX: Populate JWT with user id
    async jwt({ token, user }) {
      if (user) {
        token.id =
          user.id ||
          crypto.createHash("md5").update(user.email!).digest("hex");
      }
      return token;
    },

    // ✅ FIX: Expose id in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
});

export const { GET, POST } = handlers;
