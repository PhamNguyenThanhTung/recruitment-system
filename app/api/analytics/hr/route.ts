import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { JobStatus } from '@prisma/client';

/**
 * GET /api/analytics/hr
 * Thống kê cho HR: job đang mở, tổng ứng viên (đơn ứng tuyển),
 * nhóm theo 6 tháng gần nhất và theo từng job.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
    }
    if (session.user.role !== 'HR') {
      return NextResponse.json({ error: 'Chỉ HR được xem thống kê' }, { status: 403 });
    }

    const hrId = session.user.id;

    const [openJobsCount, totalApplicants] = await Promise.all([
      db.job.count({
        where: { userId: hrId, status: JobStatus.OPEN },
      }),
      db.application.count({
        where: { job: { userId: hrId } },
      }),
    ]);

    // 6 tháng gần nhất (tính từ đầu tháng)
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);

    const applicationsInRange = await db.application.findMany({
      where: {
        job: { userId: hrId },
        appliedAt: { gte: startMonth },
      },
      select: { appliedAt: true },
    });

    const monthBuckets: { key: string; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' });
      monthBuckets.push({ key, label });
    }

    const monthCountMap = new Map<string, number>();
    for (const { key } of monthBuckets) {
      monthCountMap.set(key, 0);
    }

    for (const app of applicationsInRange) {
      const d = new Date(app.appliedAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthCountMap.has(key)) {
        monthCountMap.set(key, (monthCountMap.get(key) ?? 0) + 1);
      }
    }

    const applicationsByMonth = monthBuckets.map(({ key, label }) => ({
      month: key,
      label,
      count: monthCountMap.get(key) ?? 0,
    }));

    const jobsWithApps = await db.job.findMany({
      where: { userId: hrId },
      select: {
        title: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const applicationsByJob = jobsWithApps.map((j) => ({
      jobTitle: j.title,
      count: j._count.applications,
    }));

    return NextResponse.json({
      openJobsCount,
      totalApplicants,
      applicationsByMonth,
      applicationsByJob,
    });
  } catch (error) {
    console.error('HR analytics error:', error);
    return NextResponse.json({ error: 'Lỗi server khi lấy thống kê' }, { status: 500 });
  }
}
