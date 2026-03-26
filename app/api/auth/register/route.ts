import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Schema kiểm tra dữ liệu đăng ký người dùng mới.
 */
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
});

/**
 * POST /api/auth/register
 * Xử lý đăng ký tài khoản người dùng mới (vai trò mặc định là HR).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    const { email, password, name } = registerSchema.parse(body);

    // Kiểm tra xem email đã tồn tại trong hệ thống chưa
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // Mã hóa mật khẩu trước khi lưu vào DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "HR", // Gán vai trò mặc định là HR
      },
    });

    // Loại bỏ mật khẩu khỏi dữ liệu phản hồi để đảm bảo bảo mật
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { success: true, data: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    // Xử lý lỗi validation từ Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Đã có lỗi xảy ra" },
      { status: 500 }
    );
  }
}
