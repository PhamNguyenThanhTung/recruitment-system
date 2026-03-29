import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Schema xác thực đăng ký - Gộp cho cả HR và Candidate
 */
const registerSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  role: z.enum(["HR", "CANDIDATE"], {
  message: "Vai trò phải là HR hoặc CANDIDATE",
}),
  phone: z.string().optional(), // Phone là tùy chọn
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // ===== Xác thực dữ liệu bằng schema =====
    const { email, password, name, role, phone } = registerSchema.parse(body);

    // ===== Kiểm tra email đã tồn tại chưa =====
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email đã tồn tại" },
        { status: 400 }
      );
    }

    // ===== Mã hóa mật khẩu =====
    const hashedPassword = await bcrypt.hash(password, 10);

    // ===== Tạo user với role tương ứng =====
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role, // Nhận role từ request body
        phone: phone || null,
      },
    });

    // ===== Loại bỏ password trước khi trả về =====
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

    if (error instanceof z.ZodError) {
      const firstIssue = error.issues?.[0];
      const message = firstIssue?.message || "Dữ liệu không hợp lệ";
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Đã có lỗi xảy ra, vui lòng thử lại sau" },
      { status: 500 }
    );
  }
}