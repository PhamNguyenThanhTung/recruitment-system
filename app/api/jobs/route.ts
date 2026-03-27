import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { jobSchema } from "@/lib/validations";
import { NextResponse } from "next/server";

/**
 * GET /api/jobs
 * Lấy danh sách các công việc. Có hỗ trợ tìm kiếm theo từ khóa 'q'.
 * 
 * Bảo mật:
 * - Nếu user là HR: chỉ hiển thị job do HR đó tạo (userId === session.user.id)
 * - Nếu user không phải HR (Candidate): chỉ hiển thị job có status "Open"
 */
export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // Build where filter dựa trên role
    const whereFilter: any = {};

    // ===== BẢNG BẢO MẬT: Filter theo role =====
    if (session?.user?.role === "HR") {
      // HR chỉ xem job của chính mình
      whereFilter.userId = session.user.id;
    } else {
      // Candidate & Guest chỉ xem job đang mở
      whereFilter.status = "Open";
    }

    // Thêm search filter nếu có query
    if (query) {
      whereFilter.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { company: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    // Tìm kiếm công việc trong database
    const jobs = await db.job.findMany({
      where: whereFilter,
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
    // 1. Kiểm tra quyền HR
    const session = await auth();
    if (!session || session.user.role !== "HR") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }

    // 2. LẤY THÔNG TIN CÔNG TY TỪ DATABASE
    // Tìm CompanyProfile dựa vào ID của người đang đăng nhập
    const hrProfile = await db.companyProfile.findUnique({
      where: { userId: session.user.id }
    });

    // Bắt lỗi: Nếu HR chưa cập nhật Profile lần đầu, chặn không cho đăng tin
    if (!hrProfile) {
      return NextResponse.json(
        { message: "Vui lòng cập nhật Thông tin Công ty trước khi đăng tin." }, 
        { status: 400 }
      );
    }

    // 3. Lấy dữ liệu Job từ phía Client gửi lên (Frontend của Đoán/Bắc)
    const body = await req.json();
    
    // ===== VALIDATE DỮ LIỆU QUELA SCHEMA (bao gồm convert deadline) =====
    // Schema sẽ tự động transform chuỗi ngày "2026-03-27" → ISO-8601 Date object
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

    // Tách company và location ra (chúng ta sẽ lấy từ hrProfile thay vì client)
    const { company, location, ...jobData } = validatedData;

    // 4. Tạo Job mới, tự động gán tên công ty và địa chỉ từ hrProfile
    const newJob = await db.job.create({
      data: {
        ...jobData, // deadline đã được convert sang Date object qua schema
        company: hrProfile.companyName, // Lấy TỰ ĐỘNG từ DB
        location: hrProfile.address,    // Lấy TỰ ĐỘNG từ DB
        userId: session.user.id,        // Gắn ID của HR tạo tin
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
