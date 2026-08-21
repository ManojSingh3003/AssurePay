import { prisma } from "@repo/db";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { Session, DefaultSession } from "next-auth";
import { checkRateLimit } from "./rateLimit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isProfileComplete: boolean;
    } & DefaultSession["user"];
  }
  interface User {
    isProfileComplete?: boolean;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone number", type: "text", placeholder: "Enter the phone number" },
        password: { label: "Password", type: "password", placeholder: "Enter the password" },
      },
      async authorize(credentials: Record<"phone" | "password", string> | undefined) {
        if (!credentials) return null;

        const isAllowed = await checkRateLimit(`login_${credentials.phone}`, 10, 900000);
        if (!isAllowed) {
            throw new Error("Too many login attempts. Please try again later.");
        }

        const existingUser = await prisma.user.findFirst({
          where: { number: credentials.phone },
        });

        if (existingUser) {
          const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
          if (passwordValidation) {
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number,
              image: existingUser.profilePicture,
              isProfileComplete: existingUser.isProfileComplete,
            };
          }
          return null;
        }
        return null;
      },
    }),
  ],
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: any; user?: any; trigger?: string; session?: any }) {
      if (user) {
        token.sub = user.id;
        token.isProfileComplete = user.isProfileComplete; 
        token.picture = user.image;
      }
      if (trigger === "update" && session?.isProfileComplete !== undefined) {
        token.isProfileComplete = session.isProfileComplete;
      }
      return token;
    },
    async session({ token, session }: { token: any; session: Session }) {
      if (session.user && token.sub) {
        session.user.id = token.sub; 
        session.user.isProfileComplete = token.isProfileComplete;
      }
      return session;
    }
  },
};