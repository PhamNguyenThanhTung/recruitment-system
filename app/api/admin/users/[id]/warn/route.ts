import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> } // ✅ Phải khớp với tên thư mục [jobId]
) {
  try {
    const { jobId } = await params; // ✅ Lấy đúng tên biến từ params

    // Database column vẫn là 'jobId' theo schema Prisma, giữ nguyên
    await db.report.deleteMany({
      where: { jobId: jobId } // ✅ Sử dụng biến jobId đã lấy
    });

    await db.job.update({
      where: { id: jobId },
      data: { status: "OPEN" }
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error(error); // Nên log lỗi để debug
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}