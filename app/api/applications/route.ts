import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { fileValidation } from '@/lib/validations';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { NextResponse, NextRequest } from 'next/server';

/**
 * POST /api/applications
 * Endpoint nộp đơn ứng tuyển cho Candidate
 * 
 * Yêu cầu:
 * - Session đăng nhập với role === 'CANDIDATE'
 * - FormData gồm: jobId (string), cvFile (File)
 * 
 * Response: 201 Created - Application object
 */
export async function POST(request: NextRequest) {
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
        { error: 'Chỉ ứng viên có thể nộp đơn' },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const cvFile = formData.get('cvFile') as File;

    if (!jobId || !cvFile) {
      return NextResponse.json(
        { error: 'jobId và cvFile là bắt buộc' },
        { status: 400 }
      );
    }

    // Xác thực file
    try {
      fileValidation(cvFile);
    } catch (error) {
      return NextResponse.json(
        { error: (error as Error).message },
        { status: 400 }
      );
    }

    // Kiểm tra job tồn tại
    const job = await db.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Công việc không tồn tại' },
        { status: 404 }
      );
    }

    // ===== BẢNG BẢO MẬT: Kiểm tra job đã mở hay không =====
    if (job.status !== 'Open') {
      return NextResponse.json(
        { error: 'Công việc này không còn nhận ứng viên' },
        { status: 403 }
      );
    }

    // Kiểm tra ứng viên đã nộp đơn cho job này chưa
    const existingApplication = await db.application.findFirst({
      where: {
        jobId,
        userId: session.user.id,
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Bạn đã nộp đơn cho công việc này' },
        { status: 409 }
      );
    }

    // Upload CV lên Cloudinary
    const cvFileUrl = await uploadToCloudinary(cvFile, 'cv_uploads');

    // Tạo Application record
    const application = await db.application.create({
      data: {
        jobId,
        userId: session.user.id,
        cvFileUrl,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi gửi đơn' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/applications
 * Endpoint danh sách ứng tuyển cho HR
 * 
 * Query params:
 * - jobId?: string
 * - status?: string
 * 
 * Response: ['applications']
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

    if (session.user.role !== 'HR') {
      return NextResponse.json(
        { error: 'Chỉ HR có thể xem danh sách ứng tuyển' },
        { status: 403 }
      );
    }

    // Parse query params
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');

    // ===== BẢNG BẢO MẬT: Nếu lọc theo jobId, kiểm tra ownership =====
    if (jobId) {
      const jobExists = await db.job.findUnique({
        where: { id: jobId },
        select: { userId: true },
      });

      if (!jobExists) {
        return NextResponse.json(
          { error: 'Job không tồn tại' },
          { status: 404 }
        );
      }

      if (jobExists.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Bạn không có quyền xem ứng viên cho job này' },
          { status: 403 }
        );
      }
    }

    // Build where filter
    // Nếu không chỉ định jobId, chỉ lấy ứng viên của các job do HR này tạo
    const where: any = {
      job: {
        userId: session.user.id, // HR chỉ xem job của chính mình
      },
    };
    if (jobId) where.jobId = jobId;
    if (status) where.status = status;

    // Lấy danh sách ứng tuyển
    const applications = await db.application.findMany({
      where,
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
      orderBy: {
        appliedAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi lấy danh sách' },
      { status: 500 }
    );
  }
}
