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
        console.log("Using demo OAuth credentials - skipping validation");
        return true;
      }
      
      // Admin allowlist - only these email addresses can access admin features
      // To add/remove admins, update this list and redeploy
      const allowedAdmins = [
        "brennen@propellic.com",
        "paul@propellic.com", 
        "amanda@propellic.com"
      ];
      
      const userEmail = user.email?.toLowerCase();
      
      if (!userEmail || !allowedAdmins.includes(userEmail)) {
        console.log(`Access denied for ${user.email} - not in admin allowlist`);
        return false;
      }
      
      console.log(`Admin access granted for ${user.email}`);
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
