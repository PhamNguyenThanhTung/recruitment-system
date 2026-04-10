import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

// app/api/admin/reports/[jobID]/route.ts

export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ jobID: string }> } // 🔥 Đổi d thành D
) {
  try {
    const { jobID } = await params; // 🔥 Đổi d thành D
    
    // Lưu ý: Trong db.report.deleteMany thì 'jobId' là tên cột trong Database, sếp giữ nguyên theo Schema
    await db.report.deleteMany({
      where: { jobId: jobID } 
    });

    await db.job.update({
      where: { id: jobID },
      data: { status: "OPEN" }
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}