import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 🔥 SỬA: Phải khai báo params là một Promise
export async function PATCH(
  req: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth();
    // Kiểm tra quyền Admin
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // 🔥 QUAN TRỌNG: Phải await params để lấy id
    const { id } = await params; 
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Lý do không được để trống" }, { status: 400 });
    }

    // Cập nhật Database
    const updatedUser = await db.user.update({
      where: { id: id },
      data: {
        warningCount: { increment: 1 },
        warningReason: reason,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[JOB_WARN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}