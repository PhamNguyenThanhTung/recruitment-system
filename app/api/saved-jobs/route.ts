import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * POST /api/saved-jobs
 * Candidate lưu một job vào bookmark.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Chỉ ứng viên có thể lưu job' }, { status: 403 });
    }

    const body = await request.json();
    const jobId = body?.jobId as string | undefined;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId là bắt buộc' }, { status: 400 });
    }

    const job = await db.job.findUnique({ where: { id: jobId }, select: { id: true } });
    if (!job) {
      return NextResponse.json({ error: 'Công việc không tồn tại' }, { status: 404 });
    }

    const savedJob = await db.savedJob.create({
      data: {
        jobId,
        userId: session.user.id,
      },
      include: {
        job: true,
      },
    });

    return NextResponse.json(savedJob, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return NextResponse.json({ error: 'Job đã được lưu trước đó' }, { status: 409 });
    }

    console.error('Create saved job error:', error);
    return NextResponse.json({ error: 'Lỗi server khi lưu job' }, { status: 500 });
  }
}

/**
 * GET /api/saved-jobs
 * Lấy danh sách job đã lưu của candidate hiện tại.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Chỉ ứng viên có thể xem job đã lưu' }, { status: 403 });
    }

    const savedJobs = await db.savedJob.findMany({
      where: { userId: session.user.id },
      include: {
        job: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(savedJobs);
  } catch (error) {
    console.error('Get saved jobs error:', error);
    return NextResponse.json({ error: 'Lỗi server khi lấy danh sách job đã lưu' }, { status: 500 });
  }
}

/**
 * DELETE /api/saved-jobs
 * Xóa bookmark theo jobId (thuận tiện cho client gọi 1 endpoint).
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Chỉ ứng viên có thể bỏ lưu job' }, { status: 403 });
    }

    const body = await request.json();
    const jobId = body?.jobId as string | undefined;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId là bắt buộc' }, { status: 400 });
    }

    await db.savedJob.deleteMany({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete saved job error:', error);
    return NextResponse.json({ error: 'Lỗi server khi xóa job đã lưu' }, { status: 500 });
  }
}
