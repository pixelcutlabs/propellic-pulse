import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-client-secret",
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Skip validation if using demo credentials
      if (process.env.GOOGLE_CLIENT_ID === "demo-client-id") {
        console.log("Using demo OAuth credentials - skipping domain validation");
        return true;
      }
      
      // Only allow users with @propellic.com email addresses
      const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "propellic.com";
      
      if (!user.email?.endsWith(`@${allowedDomain}`)) {
        console.log(`Access denied for ${user.email} - not in allowed domain ${allowedDomain}`);
        return false;
      }
      
      return true;
    },
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      
      return session;
    },
    async jwt({ user, token }) {
      if (user) {
        token.id = user.id;
      }
      
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/admin/signin",
    error: "/admin/auth-error",
  },
  debug: process.env.NODE_ENV === "development",
  logger: {
    error(code, metadata) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Error:", code, metadata);
      }
    },
    warn(code) {
      if (process.env.NODE_ENV === "development") {
        console.log("NextAuth Warning:", code);
      }
    },
  },
};
