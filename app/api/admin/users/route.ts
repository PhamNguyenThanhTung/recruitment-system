import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    // Trong app/api/admin/users/route.ts
const users = await db.user.findMany({
  select: { 
    id: true, 
    name: true, 
    email: true, 
    role: true, 
    createdAt: true,
    warningCount: true,   // Thêm dòng này
    warningReason: true   // Thêm dòng này
  },
  orderBy: { createdAt: 'desc' }
});

    return NextResponse.json(users);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}