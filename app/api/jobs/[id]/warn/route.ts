import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    const { reason } = await req.json();

    // Tăng warningCount lên 1 và cập nhật lý do
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: { 
        warningCount: { increment: 1 },
        warningReason: reason
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}