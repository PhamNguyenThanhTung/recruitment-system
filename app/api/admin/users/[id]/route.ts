import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // Ép kiểu Promise
) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const { id } = await params; // Await params

    // 🛡️ CHỐT CHẶN BẢO MẬT: Không cho Admin tự xóa chính mình
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Bạn không thể tự xóa tài khoản của chính mình!" },
        { status: 400 }
      );
    }

    // Thực hiện xóa vĩnh viễn (Hard Delete)
    await db.user.delete({
      where: { id: id },
    });

    return new NextResponse("User deleted successfully", { status: 200 });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}