import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

/**
 * Mở rộng các kiểu dữ liệu của NextAuth để bao gồm thông tin 'role' và 'id' của người dùng.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

/**
 * Cấu hình NextAuth để xử lý đăng nhập bằng Email và Mật khẩu (Credentials).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      // Hàm xác thực thông tin đăng nhập
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Tìm người dùng trong cơ sở dữ liệu bằng email
        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        // Nếu không tìm thấy người dùng hoặc người dùng không có mật khẩu
        if (!user || !user.password) return null;

        // So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong DB
        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) return null;

        // Trả về thông tin người dùng nếu xác thực thành công
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // Callback xử lý dữ liệu Token JWT
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    // Callback xử lý dữ liệu Session
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Đường dẫn trang đăng nhập tùy chỉnh
  },
  session: {
    strategy: "jwt", // Sử dụng JWT để quản lý phiên đăng nhập
  },
});
