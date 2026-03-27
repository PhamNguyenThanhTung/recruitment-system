import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { companyProfileSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/company
 * 
 * Endpoint để lấy hồ sơ công ty của HR hiện tại.
 * Yêu cầu: Người dùng phải đăng nhập và có role 'HR'
 * 
 * @returns CompanyProfile nếu tồn tại, null nếu chưa có
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

    // Kiểm tra role là HR
    if (session.user.role !== 'HR') {
      return NextResponse.json(
        { error: 'Chỉ HR mới được truy cập tài nguyên này' },
        { status: 403 }
      );
    }

    // Tìm hồ sơ công ty
    const companyProfile = await db.companyProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(companyProfile || null, { status: 200 });
  } catch (error) {
    console.error('❌ Lỗi GET /api/profile/company:', error);
    return NextResponse.json(
      { error: 'Không thể tải hồ sơ công ty' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profile/company
 * 
 * Endpoint để cập nhật hoặc tạo hồ sơ công ty.
 * Sử dụng upsert: nếu hồ sơ tồn tại thì update, chưa tồn tại thì create.
 * Yêu cầu: Người dùng phải đăng nhập và có role 'HR'
 * 
 * @param body - Dữ liệu hồ sơ công ty (companyName, address, website?, description?)
 * @returns CompanyProfile sau khi cập nhật/tạo
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

    // Kiểm tra role là HR
    if (session.user.role !== 'HR') {
      return NextResponse.json(
        { error: 'Chỉ HR mới được truy cập tài nguyên này' },
        { status: 403 }
      );
    }

    // Lấy dữ liệu từ request body
    const body = await request.json();

    // Xác thực dữ liệu bằng schema
    const validatedData = companyProfileSchema.parse(body);

    // Upsert hồ sơ công ty
    const companyProfile = await db.companyProfile.upsert({
      where: { userId: session.user.id },
      update: {
        companyName: validatedData.companyName,
        address: validatedData.address,
        website: validatedData.website || null,
        description: validatedData.description || null,
      },
      create: {
        userId: session.user.id,
        companyName: validatedData.companyName,
        address: validatedData.address,
        website: validatedData.website || null,
        description: validatedData.description || null,
      },
    });

    return NextResponse.json(companyProfile, { status: 200 });
  } catch (error: any) {
    console.error('❌ Lỗi POST /api/profile/company:', error);

    // Xử lý lỗi validation
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Không thể cập nhật hồ sơ công ty' },
      { status: 500 }
    );
  }
}
