import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // 🔥 QUAN TRỌNG: Phải await params trước khi dùng
    const { id } = await params; 
    const { status } = await req.json();

    const job = await db.job.update({
      where: { id: id }, // Dùng id đã await
      data: { status }
    });
    return NextResponse.json(job);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// 2. Sửa hàm DELETE (Cái đang gây lỗi build trên Vercel của sếp)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 🔥 Bắt buộc là Promise
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    const { id } = await params; // 🔥 Phải await để lấy id

    await db.job.delete({
      where: { id: id }
    });

    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[JOB_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}