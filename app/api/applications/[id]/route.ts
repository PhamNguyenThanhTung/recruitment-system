import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';
import { ApplicationStatus } from '@prisma/client'; // 🔥 Thêm dòng này để ép kiểu

/**
 * GET /api/applications/[id]
 * Endpoint lấy chi tiết ứng tuyển (chỉ cho HR)
 * * Path params: id (string)
 * * Response: Application object với thông tin đầy đủ
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'HR') {
      return NextResponse.json(
        { error: 'Chỉ HR có thể xem chi tiết ứng tuyển' },
        { status: 403 }
      );
    }

    // Lấy id từ params
    const { id } = await params;

    // Tìm application
    const application = await db.application.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            description: true,
            userId: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Ứng tuyển không tồn tại' },
        { status: 404 }
      );
    }

    // ===== BẢNG BẢO MẬT: Kiểm tra HR owns this job =====
    if (application.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền xem ứng tuyển này' },
        { status: 403 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error('Get application detail error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy chi tiết' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications/[id]
 * Endpoint cập nhật trạng thái ứng tuyển (chỉ cho HR)
 * * Path params: id (string)
 * Body: { status: string } - pending, reviewed, interview, accepted, rejected
 * * Response: Application object sau khi cập nhật
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Kiểm tra session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'HR') {
      return NextResponse.json(
        { error: 'Chỉ HR có thể cập nhật trạng thái ứng tuyển' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 🔥 FIX LỖI Ở ĐÂY: Ép sang chữ HOA và dùng mảng chuẩn của Database
    const upperStatus = status?.toUpperCase();
    const validStatuses = ['PENDING', 'REVIEWING', 'INTERVIEWING', 'OFFERED', 'REJECTED'];
    
    if (!upperStatus || !validStatuses.includes(upperStatus)) {
      return NextResponse.json(
        { error: `Trạng thái không hợp lệ. Phải là: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // ===== Kiểm tra application tồn tại =====
    const application = await db.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Ứng tuyển không tồn tại' },
        { status: 404 }
      );
    }

    // ===== Kiểm tra quyền: HR phải là chủ của job này =====
    if (application.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật ứng tuyển này' },
        { status: 403 }
      );
    }

    // ===== Cập nhật status =====
    const updatedApplication = await db.application.update({
      where: { id },
      data: { status: upperStatus as ApplicationStatus }, // 🔥 Truyền chữ HOA xuống Prisma
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
      },
    });

    return NextResponse.json(updatedApplication, { status: 200 });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}