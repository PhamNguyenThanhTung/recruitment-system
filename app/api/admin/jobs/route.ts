import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { JobStatus } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 403 });

    const pendingJobs = await db.job.findMany({
      where: { status: JobStatus.PENDING },
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(pendingJobs);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}