import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { JobStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    // Chỉ ứng viên mới được đi báo cáo người khác
    if (!session?.user?.id || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Vui lòng đăng nhập với tư cách Ứng viên để báo cáo' }, { status: 403 });
    }

    const { jobId, reason } = await req.json();

    if (!jobId || !reason || reason.trim() === '') {
      return NextResponse.json({ error: 'Vui lòng nhập lý do báo cáo' }, { status: 400 });
    }

    // 1. Lưu báo cáo vào Database
    const newReport = await db.report.create({
      data: {
        jobId,
        userId: session.user.id,
        reason,
      }
    });

    // 2. 🔥 LOGIC NÂNG CAO: Tự động khóa tin nếu bị Report quá nhiều
    // Đếm xem Job này đã bị bao nhiêu người report rồi
    const reportCount = await db.report.count({
      where: { jobId }
    });

    // Nếu bị 3 người khác nhau report trở lên -> Auto chuyển về PENDING chờ Admin xử lý
    if (reportCount >= 3) {
      await db.job.update({
        where: { id: jobId },
        data: { status: JobStatus.PENDING }
      });
    }

    return NextResponse.json({ message: 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét ngay lập tức!' }, { status: 201 });

  } catch (error) {
    console.error('Lỗi khi gửi báo cáo:', error);
    return NextResponse.json({ error: 'Lỗi server khi gửi báo cáo' }, { status: 500 });
  }
}