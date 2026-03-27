import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { candidateProfileSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/candidate
 * 
 * Endpoint để lấy hồ sơ ứng viên của Candidate hiện tại.
 * Yêu cầu: Người dùng phải đăng nhập và có role 'CANDIDATE'
 * 
 * @returns CandidateProfile nếu tồn tại, null nếu chưa có
 */
export async function GET(request: NextRequest) {
  try {
    // Lấy session từ NextAuth
    const session = await auth();

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Kiểm tra role là CANDIDATE
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Chỉ ứng viên mới được truy cập tài nguyên này' },
        { status: 403 }
      );
    }

    // Tìm hồ sơ ứng viên
    const candidateProfile = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(candidateProfile || null, { status: 200 });
  } catch (error) {
    console.error('❌ Lỗi GET /api/profile/candidate:', error);
    return NextResponse.json(
      { error: 'Không thể tải hồ sơ ứng viên' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/candidate
 * 
 * Endpoint để cập nhật hoặc tạo hồ sơ ứng viên.
 * Sử dụng upsert: nếu hồ sơ tồn tại thì update, chưa tồn tại thì create.
 * Yêu cầu: Người dùng phải đăng nhập và có role 'CANDIDATE'
 * 
 * @param body - Dữ liệu hồ sơ ứng viên (address?, skills?, bio?)
 * @returns CandidateProfile sau khi cập nhật/tạo
 */
export async function POST(request: NextRequest) {
  try {
    // Lấy session từ NextAuth
    const session = await auth();

    // Kiểm tra xem người dùng đã đăng nhập chưa
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    // Kiểm tra role là CANDIDATE
    if (session.user.role !== 'CANDIDATE') {
      return NextResponse.json(
        { error: 'Chỉ ứng viên mới được truy cập tài nguyên này' },
        { status: 403 }
      );
    }

    // Lấy dữ liệu từ request body
    const body = await request.json();

    // Xác thực dữ liệu bằng schema
    const validatedData = candidateProfileSchema.parse(body);

    // Upsert hồ sơ ứng viên
    const candidateProfile = await db.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: {
        address: validatedData.address || null,
        skills: validatedData.skills || null,
        bio: validatedData.bio || null,
      },
      create: {
        userId: session.user.id,
        address: validatedData.address || null,
        skills: validatedData.skills || null,
        bio: validatedData.bio || null,
      },
    });

    return NextResponse.json(candidateProfile, { status: 200 });
  } catch (error: any) {
    console.error('❌ Lỗi POST /api/profile/candidate:', error);

    // Xử lý lỗi validation
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Không thể cập nhật hồ sơ ứng viên' },
      { status: 500 }
    );
  }
}
