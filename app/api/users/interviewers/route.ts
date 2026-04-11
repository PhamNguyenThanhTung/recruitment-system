import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    
    // Cho phép cả HR và ADMIN truy cập
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "HR")) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const interviewers = await db.user.findMany({
      where: {
        role: { in: ["HR", "ADMIN"] } // Lấy cả HR và Admin
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return NextResponse.json(interviewers);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}