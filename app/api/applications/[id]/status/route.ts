import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { applicationStatusSchema } from '@/lib/validations';
import { NextResponse, NextRequest } from 'next/server';

/**
 * PATCH /api/applications/[id]/status
 * Endpoint cập nhật trạng thái ứng tuyển (chỉ cho HR)
 * 
 * Path params: id (string)
 * Request body: { status: string }
 * 
 * Response: Updated Application object
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

    // Lấy id từ params
    const { id } = await params;

    // Parse và xác thực body
    const body = await request.json();
    const validatedData = applicationStatusSchema.parse(body);

    // Kiểm tra ứng tuyển tồn tại
    const existingApplication = await db.application.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Ứng tuyển không tồn tại' },
        { status: 404 }
      );
    }

    // Cập nhật trạng thái
    const updatedApplication = await db.application.update({
      where: { id },
      data: {
        status: validatedData.status,
      },
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

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.message },
        { status: 400 }
      );
    }

    console.error('Update application status error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi cập nhật trạng thái' },
      { status: 500 }
    );
  }
}
