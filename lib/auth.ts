import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const sessionUpdateSchema = z.object({
  image: z.string().url().optional(),
  phone: z.string().optional(),
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      phone?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // Trả về đầy đủ object để JWT callback nhận được
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role, // "ADMIN", "HR", hoặc "CANDIDATE"
          image: user.image,
          phone: user.phone ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email as string },
        });
        if (!existingUser) {
          const query = new URLSearchParams({
            email: user.email || "",
            name: user.name || "",
            image: user.image || "",
            provider: "google"
          }).toString();
          return `/register?${query}`; 
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      // 1. Lần đầu đăng nhập: Chép thông tin từ User object sang Token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }

      // 2. Nếu đăng nhập bằng Google, ta cần đảm bảo lấy Role mới nhất từ DB
      // (Vì Google provider mặc định không biết Role trong DB của mình)
      if (!token.role && token.email) {
        const dbUser = await db.user.findUnique({
          where: { email: token.email },
          select: { role: true, id: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.id = dbUser.id;
        }
      }

      // 3. Xử lý khi có trigger update profile
      if (trigger === "update" && session) {
        const parsed = sessionUpdateSchema.safeParse(session);
        if (parsed.success) {
          if (parsed.data.image) token.picture = parsed.data.image;
          if (parsed.data.phone) token.phone = parsed.data.phone;
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string; // 🔥 Đây là dòng cứu mạng sếp
        session.user.phone = token.phone as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
});