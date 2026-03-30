import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { applicationStatusSchema } from '@/lib/validations';
import { NextResponse, NextRequest } from 'next/server';
import { sendStatusUpdateEmail } from '@/lib/email';
import { z } from 'zod';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Ép kiểu Promise cho Next.js 15
) {
  try {
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
    
    const { id } = await params; // 🔥 FIX: Bắt buộc phải có await ở đây

    const body = await request.json();
    const validatedData = applicationStatusSchema.parse(body);

    const existingApplication = await db.application.findUnique({
      where: { id },
      select: { job: { select: { userId: true } } },
    });

    if (!existingApplication) {
      return NextResponse.json(
        { error: 'Ứng tuyển không tồn tại' },
        { status: 404 }
      );
    }

    if (existingApplication.job.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bạn không có quyền cập nhật ứng tuyển này' },
        { status: 403 }
      );
    }

    // Cập nhật trạng thái và lấy chính xác những gì cần cho Email
    const updatedApplication = await db.application.update({
      where: { id },
      data: { status: validatedData.status },
      include: {
        user: { select: { name: true, email: true } },
        job: {
          select: {
            title: true,
            company: true,
            user: {
              select: {
                companyProfile: { select: { companyName: true } }
              }
            }
          }
        }
      }
    });

    // Gửi email thông báo (Graceful failure)
    if (updatedApplication.user.email) {
      // Fire-and-forget: Không await để trả response cho HR nhanh hơn
      sendStatusUpdateEmail({
        to: updatedApplication.user.email,
        candidateName: updatedApplication.user.name ?? 'Ứng viên',
        jobTitle: updatedApplication.job.title,
        newStatus: updatedApplication.status,
        companyName: updatedApplication.job.user.companyProfile?.companyName ?? updatedApplication.job.company,
      }).catch(err => console.error('Lỗi gửi mail âm thầm:', err));
    }

    return NextResponse.json(updatedApplication);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.flatten().fieldErrors },
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