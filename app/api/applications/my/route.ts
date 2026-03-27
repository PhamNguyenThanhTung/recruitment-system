import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextResponse, NextRequest } from 'next/server';

/**
 * GET /api/applications/my
 * Endpoint danh sách ứng tuyển của Candidate (chỉ cho xem ứng tuyển riêng của mình)
 * 
 * Response: ['applications'] với thông tin job
 */
export async function GET(request: NextRequest) {
  try {
    // Kiểm tra session
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Chỉ ứng viên có thể xem ứng tuyển của mình' },
        { status: 403 }
      );
    }

    // Lấy danh sách ứng tuyển của candidate hiện tại
    const applications = await db.application.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
          },
        },
      },
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy danh sách ứng tuyển' },
      { status: 500 }
    );
  }
}
