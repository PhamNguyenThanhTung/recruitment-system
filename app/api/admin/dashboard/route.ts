import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // 1. Lấy danh sách tin bị báo cáo hoặc chờ duyệt
    const reportedJobs = await db.job.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { report: { some: {} } }
        ]
      },
      include: {
        user: { select: { name: true, email: true } },
        report: { select: { reason: true, createdAt: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Lấy số liệu cho 3 thẻ thống kê
    const totalUsers = await db.user.count();
    const totalJobs = await db.job.count();
    // Giả sử sếp có bảng application, nếu không có thì sếp bỏ dòng này đi nhé
    const totalApplications = await db.application.count().catch(() => 0); 

    // 3. 🔥 TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ (7 NGÀY QUA TỪ DATABASE)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0); // Bắt đầu ngày
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1); // Kết thúc ngày

      // Đếm user và job được tạo trong ngày hôm đó
      const usersCreated = await db.user.count({
        where: { createdAt: { gte: date, lt: nextDate } }
      });
      const jobsCreated = await db.job.count({
        where: { createdAt: { gte: date, lt: nextDate } }
      });

      // Lấy tên thứ (VD: T2, T3...)
      const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });

      chartData.push({
        name: dayName,
        users: usersCreated,
        jobs: jobsCreated
      });
    }

    // 4. Trả về toàn bộ cục dữ liệu
    return NextResponse.json({
      stats: {
        totalUsers,
        totalJobs,
        totalApplications,
        chartData // Truyền cục data thật này xuống Frontend
      },
      reportedJobs
    });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}