import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

/**
 * GET /api/applications/[id]
 * Endpoint lấy chi tiết ứng tuyển (chỉ cho HR)
 * 
 * Path params: id (string)
 * 
 * Response: Application object với thông tin đầy đủ
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

    return NextResponse.json(application);
  } catch (error) {
    console.error('Get application detail error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy chi tiết' },
      { status: 500 }
    );
  }
}
