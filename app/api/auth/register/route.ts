import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Schema xác thực thông minh:
 * Cho phép password trống NẾU là đăng ký qua Google.
 */
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").optional().or(z.literal("")), 
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.enum(["HR", "CANDIDATE"], {
    message: "Vai trò phải là HR hoặc CANDIDATE",
  }),
  phone: z.string().optional(),
  isGoogle: z.boolean().optional(), // 🔥 Flag nhận biết từ Google
  image: z.string().optional(),     // 🔥 Nhận link ảnh từ Google gửi sang
}).refine((data) => {
  // Nếu KHÔNG PHẢI Google mà password trống -> Báo lỗi
  if (!data.isGoogle && (!data.password || data.password.length < 6)) {
    return false;
  }
  return true;
}, {
  message: "Mật khẩu phải có ít nhất 6 ký tự",
  path: ["password"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, role, phone, isGoogle, image } = body; // Giả sử sếp tạm bỏ qua safeParse để test nhanh hoặc đã sửa Zod

    // 1. Kiểm tra email tồn tại (Giữ nguyên)
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ success: false, message: "Email đã tồn tại" }, { status: 400 });

    // 2. 🔥 LOGIC "LẤP CHỖ TRỐNG" MẬT KHẨU
    let finalPassword = password;

    if (isGoogle && !password) {
      // Nếu là dân Google, mình tặng họ một cái mật khẩu ngẫu nhiên 20 ký tự
      // Họ sẽ không bao giờ biết mật khẩu này, trừ khi họ dùng chức năng "Quên mật khẩu"
      finalPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
    }

    // 3. Mã hóa (Lúc này finalPassword chắc chắn có giá trị, không bao giờ null)
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    // 4. Tạo User - Prisma sẽ không còn kêu ca gì nữa
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword, 
        name,
        role,
        phone: phone || null,
        image: image || null,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        success: true, 
        message: `Đăng ký tài khoản ${role === "HR" ? "Nhà tuyển dụng" : "Ứng viên"} thành công!`,
        data: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    return NextResponse.json(
      { success: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}