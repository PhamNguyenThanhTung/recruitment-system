import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// 🔥 Dòng 5: PHẢI CÓ Promise như thế này
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // 🔥 Dòng 13: PHẢI await params
    const { id } = await params; 
    
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Lý do không được để trống" }, { status: 400 });
    }

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