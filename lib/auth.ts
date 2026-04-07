import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google"; // 🔥 BỔ SUNG: Import thư viện Google
import { db } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const sessionUpdateSchema = z.object({
  image: z.url("Link ảnh không hợp lệ").optional(),
  phone: z.string().regex(/(84|0[3|5|7|8|9])+([0-9]{8})\b/, "Số điện thoại sai định dạng").optional(),
});

/**
 * Mở rộng các kiểu dữ liệu của NextAuth để bao gồm thông tin 'role' và 'id' của người dùng.
 */
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

/**
 * Cấu hình NextAuth
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // 🔥 BỔ SUNG 1: Cấu hình Đăng nhập bằng Google
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "CANDIDATE", // Mặc định ai dùng Google cũng là Ứng viên
        };
      },
    }),

    // Cấu hình Đăng nhập bằng Mật khẩu (Giữ nguyên của sếp)
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "text" }, // 🔥 Nhận cờ remember từ Frontend gửi lên
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          phone: user.phone ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    // Trong callbacks của lib/auth.ts
async signIn({ user, account }) {
  if (account?.provider === "google") {
    try {
      // 1. Kiểm tra xem Email Google này đã có trong DB chưa
      const existingUser = await db.user.findUnique({
        where: { email: user.email as string },
      });

      // 2. NẾU CHƯA CÓ TÀI KHOẢN -> ĐÁ SANG TRANG ĐĂNG KÝ
      if (!existingUser) {
        // Mã hóa thông tin để đưa lên URL an toàn
        const query = new URLSearchParams({
          email: user.email || "",
          name: user.name || "",
          image: user.image || "",
          provider: "google" // Để trang đăng ký biết là đang đăng ký bằng Google
        }).toString();

        // Trả về link redirect (NextAuth v5 hỗ trợ trả về chuỗi URL để chuyển hướng)
        return `/register?${query}`; 
      }
      
      // 3. Nếu đã có tài khoản rồi thì cho đăng nhập bình thường
      return true; 
    } catch (error) {
      console.error("Lỗi xác thực Google:", error);
      return "/login?error=OAuthError";
    }
  }
  return true;
},


    // Callback xử lý dữ liệu Token JWT
    async jwt({ token, user, account, trigger, session }) {
      // 1. KHI NGƯỜI DÙNG MỚI ĐĂNG NHẬP (Chỉ chạy 1 lần lúc vừa login xong)
      if (user) {
        if (account?.provider === "google") {
          // 🔥 NẾU LÀ GOOGLE: Phải vào DB lấy ID thật (cuid) đè lên ID ảo của Google
          const dbUser = await db.user.findUnique({
            where: { email: user.email as string },
          });

          if (dbUser) {
            token.id = dbUser.id; // Lấy ID thật từ Database
            token.role = dbUser.role; // Lấy Role thật
            token.phone = dbUser.phone;
            token.picture = dbUser.image;
          }
        } else {
          // NẾU LÀ CREDENTIALS: user.id đã là ID thật từ DB rồi, cứ thế dùng
          token.id = user.id;
          token.role = user.role;
          token.phone = user.phone;
          token.picture = user.image;
        }
      }
      
      // 2. KHI GỌI HÀM UPDATE SESSION TỪ FRONTEND (Giữ nguyên)
      if (trigger === "update" && session) {
        const parsed = sessionUpdateSchema.safeParse(session);
        if (parsed.success) {
          if (parsed.data.image) token.picture = parsed.data.image;
          if (parsed.data.phone) token.phone = parsed.data.phone; 
        } else {
          console.error("Phát hiện payload update session không hợp lệ:", parsed.error);
        }
      }
      
      return token;
    },

    // Callback xử lý dữ liệu Session
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null | undefined;
        session.user.phone = token.phone as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    // 🔥 BỔ SUNG 3: Đặt thời gian sống của Cookie là 30 ngày (Cho tính năng Ghi nhớ)
    maxAge: 30 * 24 * 60 * 60, 
  },
});