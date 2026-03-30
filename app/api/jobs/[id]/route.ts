import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
import { JobStatus } from "@prisma/client";


const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.nativeEnum(JobStatus).optional(),
});

// --- GET: Lấy chi tiết Job + Profile Công ty ---
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> } // 🔥 FIX: Đổi thành Promise
) {
  try {
    const { id } = await params; // 🔥 FIX: Phải có await
    const job = await db.job.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            companyProfile: true, // Lấy profile để hiện Logo/Quy mô
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ success: false, message: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("GET job error:", error);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// --- PUT: Cập nhật Job (Chỉ dành cho HR chủ sở hữu) ---
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const job = await db.job.findUnique({ where: { id } });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const validatedData = updateJobSchema.parse(body);

    const updatedJob = await db.job.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}

// --- DELETE: Xóa Job ---
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const job = await db.job.findUnique({ where: { id } });

    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });
    if (job.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await db.job.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}