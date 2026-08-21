import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@repo/db";

type AuthInfo = {
    user: {
        email?: string | null;
        name?: string | null;
    },
    account?: {
      provider: string;
    } | null
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    CredentialsProvider({
      name: "Business Email",
      credentials: {
        email: { label: "Business Email", type: "text", placeholder: "merchant@business.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<"email" | "password", string> | undefined) {
        if (!credentials) return null;

        const merchant = await prisma.merchant.findUnique({ 
          where: {
            email: credentials.email
          }
        });

        if(!merchant){
          return null;
        }

       
        const passwordMatch = await bcrypt.compare(credentials.password, merchant.password || "");

        if(!passwordMatch){
          return null;
        }
        return {
          id: merchant.id.toString(),
          name: merchant.name,
          email: merchant.email
        };
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account }: AuthInfo) {
      if (!user || !user.email) {
        return false;
      }

      await prisma.merchant.upsert({
        where: {
          email: user.email,
        },
        create: {
          email: user.email,
          name: user.name,
          merchantCode: `APM-${Math.random().toString(36).substring(2,8).toUpperCase()}`,
          // This line automatically detects if they used Google or Github!
          auth_type: account?.provider === "google" ? "Google" : "Github",
        },
        update: {
          name: user.name,
        },
      });

      return true;
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        const dbUser = await prisma.merchant.findUnique({
            where: { email: user.email }
        });
        if (dbUser) {
            token.uid = dbUser.id.toString();
        }
      } else if (!token.uid && token.email) {
        const dbUser = await prisma.merchant.findUnique({
            where: { email: token.email }
        });
        if (dbUser) {
            token.uid = dbUser.id.toString();
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token.uid) {
        session.user.id = token.uid;
      }
      return session;
    },
  },
  cookies: {
    sessionToken: {
      name: `merchant-app.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};