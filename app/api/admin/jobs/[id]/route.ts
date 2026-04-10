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

// Dùng DELETE để Xóa vĩnh viễn tin rác
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    await db.job.delete({ where: { id: params.id } });
    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}