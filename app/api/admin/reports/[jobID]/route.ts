import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

// 🔥 SỬA 1: Khai báo params là một Promise
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ jobId: string }> } 
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // 🔥 SỬA 2: Phải await params để lấy jobId ra
    const { jobId } = await params;

    // 1. Xóa sạch các đơn tố cáo (Report) liên quan đến Job này
    await db.report.deleteMany({
      where: { jobId: jobId } // Dùng jobId đã await
    });

    // 2. Minh oan cho HR: Ép trạng thái Job về lại OPEN
    await db.job.update({
      where: { id: jobId },
      data: { status: JobStatus.OPEN }
    });

    return new NextResponse("Đã bỏ qua báo cáo và khôi phục tin", { status: 200 });
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}