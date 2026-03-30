import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { jobSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client"; // 🔥 FIX LỖI 500: Thêm dòng import này

/**
 * GET /api/jobs
 * Lấy danh sách các công việc. Có hỗ trợ tìm kiếm theo từ khóa 'q'.
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = searchParams.get("limit"); 

    const whereFilter: any = {};

    // ===== BẢNG BẢO MẬT: Filter theo role =====
    if (session?.user?.role === "HR") {
      // HR chỉ xem job của chính mình
      whereFilter.userId = session.user?.id; 
    } else {
      // 🔥 Dùng đúng Enum của Prisma thay vì string
      whereFilter.status = JobStatus.OPEN; 
    }

    // Thêm search filter nếu có query (Tìm cả Title, Company, Description)
    if (query) {
      whereFilter.AND = [
        ...(whereFilter.status ? [{ status: JobStatus.OPEN }] : []),
        ...(whereFilter.userId ? [{ userId: session?.user?.id }] : []), 
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { company: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      ];
      
      delete whereFilter.status;
      delete whereFilter.userId;
    }

    // Cấu hình query
    const queryOptions: any = {
      where: whereFilter,
      orderBy: { createdAt: "desc" }, 
    };

    if (limit && !isNaN(Number(limit))) {
      queryOptions.take = Number(limit);
    }

    // Tìm kiếm công việc trong database
    const jobs = await db.job.findMany(queryOptions);

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    console.error("GET Jobs Error:", error);
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
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }

    const hrProfile = await db.companyProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!hrProfile) {
      return NextResponse.json(
        { message: "Vui lòng cập nhật Thông tin Công ty trước khi đăng tin." }, 
        { status: 400 }
      );
    }

    const body = await req.json();
    
    let validatedData;
    try {
      validatedData = jobSchema.parse(body);
    } catch (error) {
      console.error("❌ Validation error:", error);
      return NextResponse.json(
        { message: "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại." },
        { status: 400 }
      );
    }

    const { company, location, ...jobData } = validatedData;

    const newJob = await db.job.create({
      data: {
        ...jobData, 
        company: hrProfile.companyName, 
        location: hrProfile.address,    
        userId: session.user.id,        
      }
    });

    return NextResponse.json(
      { message: "Tạo tin tuyển dụng thành công", job: newJob }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Lỗi tạo tin tuyển dụng:", error);
    return NextResponse.json({ message: "Lỗi Server" }, { status: 500 });
  }
}