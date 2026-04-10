import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

export async function DELETE(req: Request, { params }: { params: { jobId: string } }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // 1. Xóa sạch các đơn tố cáo (Report) liên quan đến Job này
    await db.report.deleteMany({
      where: { jobId: params.jobId }
    });

    // 2. Minh oan cho HR: Ép trạng thái Job về lại OPEN (phòng trường hợp nó đang bị cắm cờ PENDING)
    await db.job.update({
      where: { id: params.jobId },
      data: { status: JobStatus.OPEN }
    });

    return new NextResponse("Đã bỏ qua báo cáo và khôi phục tin", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}