import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // Dùng Promise.all để chạy 4 lệnh đếm cùng lúc cho tốc độ bàn thờ
    const [totalUsers, totalJobs, pendingJobs, totalReports] = await Promise.all([
      db.user.count(),
      db.job.count(),
      db.job.count({ where: { status: "PENDING" } }),
      db.report.count() // Đếm tổng số đơn tố cáo
    ]);

    // Dữ liệu mô phỏng cho biểu đồ 7 ngày qua (Sếp có thể thay bằng logic đếm theo ngày thực tế sau)
    const chartData = [
      { name: 'T2', jobs: 12, users: 4 },
      { name: 'T3', jobs: 19, users: 7 },
      { name: 'T4', jobs: 15, users: 5 },
      { name: 'T5', jobs: 22, users: 10 },
      { name: 'T6', jobs: 30, users: 15 },
      { name: 'T7', jobs: 25, users: 8 },
      { name: 'CN', jobs: 18, users: 6 },
    ];

    return NextResponse.json({
      totalUsers,
      totalJobs,
      pendingJobs,
      totalReports,
      chartData
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}