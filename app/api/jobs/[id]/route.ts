import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const jobSchema = z.object({
  title: z.string().min(1).optional(),
  company: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().min(1).optional(),
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(["Draft", "Open", "Closed"]).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const job = await db.job.findUnique({
      where: { id: params.id },
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
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await db.job.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    if (job.userId !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = jobSchema.parse(body);

    const updatedJob = await db.job.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json({ success: true, data: updatedJob });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const job = await db.job.findUnique({
      where: { id: params.id },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 }
      );
    }

    if (job.userId !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await db.job.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
