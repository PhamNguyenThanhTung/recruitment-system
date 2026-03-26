import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Định nghĩa schema kiểm tra dữ liệu đầu vào cho công việc bằng Zod.
 */
const jobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().min(1),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["Draft", "Open", "Closed"]).default("Draft"),
});

/**
 * GET /api/jobs
 * Lấy danh sách các công việc. Có hỗ trợ tìm kiếm theo từ khóa 'q'.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // Tìm kiếm công việc trong database
    const jobs = await db.job.findMany({
      where: query ? {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { company: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      } : {},
      orderBy: { createdAt: "desc" }, // Sắp xếp theo thời gian tạo mới nhất
    });

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/jobs
 * Tạo một tin tuyển dụng mới. Chỉ dành cho người dùng đã đăng nhập với vai trò HR.
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    // Kiểm tra quyền hạn
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    // Validate dữ liệu từ client
    const validatedData = jobSchema.parse(body);

    // Lưu vào database
    const job = await db.job.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    // Xử lý lỗi validation từ Zod
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error("Job creation error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
