import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema cho tạo mới (vẫn giữ company và location)
const createJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().min(1),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["Draft", "Open", "Closed"]).default("Draft"),
});

// Schema cho cập nhật – KHÔNG có company và location
const updateJobSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["Draft", "Open", "Closed"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    console.error("GET job error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    // Kiểm tra quyền sở hữu
    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    // Validate dữ liệu update (không bao gồm company, location)
    const validatedData = updateJobSchema.parse(body);

    const updatedJob = await db.job.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstIssue = error.issues?.[0];
      const message = firstIssue?.message || "Validation error";
      return NextResponse.json(
        { success: false, message },
        { status: 400 }
      );
    }
    console.error("PUT job error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const job = await db.job.findUnique({
      where: { id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    if (job.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await db.job.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("DELETE job error:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}