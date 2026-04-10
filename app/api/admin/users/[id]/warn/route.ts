import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Ép kiểu Promise cho params
) {
  try {
    const session = await auth();
    // Chặn nếu không phải ADMIN
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params; // Phải await để lấy id
    const { reason } = await req.json();

    if (!reason) {
      return NextResponse.json({ error: "Lý do không được để trống" }, { status: 400 });
    }

    // Cập nhật Database: Tăng 1 đơn vị và lưu lý do
    const updatedUser = await db.user.update({
      where: { id: id },
      data: {
        warningCount: { increment: 1 },
        warningReason: reason,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_WARN_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}