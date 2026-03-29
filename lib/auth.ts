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
      phone?: string; // 🔥 THÊM DÒNG NÀY
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone?: string; // 🔥 THÊM DÒNG NÀY
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
          image: user.image, // 🔥 BỔ SUNG: Lấy ảnh từ DB khi mới đăng nhập
          phone: user.phone, // 🔥 BỔ SUNG: Lấy số điện thoại từ DB khi mới đăng nhập
        };
      },
    }),
  ],
  callbacks: {
    // Callback xử lý dữ liệu Token JWT
    // 🔥 BỔ SUNG: Thêm tham số `trigger` và `session` để hứng lệnh update từ Frontend
    jwt({ token, user, trigger, session }) {
      // 1. Khi người dùng mới đăng nhập
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image; // Lưu ảnh vào token (NextAuth dùng chữ 'picture')
        token.phone = user.phone; // 🔥 BỔ SUNG: Lưu số điện thoại vào token
      
      }
      
      // 2. Khi Frontend gọi hàm `update({ image: "link_moi" })`
      if (trigger === "update" && session) {
        if (session.image) token.picture = session.image;
        if (session.phone) token.phone = session.phone; // 🔥 THÊM DÒNG NÀY: Cập nhật SĐT mới từ form
        
      }
      
      return token;
    },
    // Callback xử lý dữ liệu Session
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        session.user.image = token.picture as string | null | undefined; // 🔥 BỔ SUNG: Đẩy ảnh ra UI
        session.user.phone = token.phone as string | undefined; // 🔥 THÊM DÒNG NÀY: Đẩy SĐT ra UI
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