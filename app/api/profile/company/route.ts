import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { companyProfileSchema, updateCompanyProfileSchema } from '@/lib/validations';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

/**
 * PUT /api/profile/company
 * 
 * Endpoint để cập nhật hồ sơ công ty.
 * Yêu cầu: Người dùng phải đăng nhập và có role 'HR'
 * 
 * @param body - Dữ liệu hồ sơ công ty (companyName, address, website?, description?, logoUrl?, size?, foundedYear?)
 * @returns CompanyProfile sau khi cập nhật
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'HR') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validatedData = updateCompanyProfileSchema.parse(body);

        // Check if profile exists to decide if creation validation is needed
        const existingProfile = await db.companyProfile.findUnique({
            where: { userId: session.user.id },
        });

        // If creating a new profile, enforce required fields
        if (!existingProfile) {
            if (!validatedData.companyName || validatedData.companyName.length < 2) {
                return NextResponse.json({ error: 'Company name is required and must be at least 2 characters long for new profiles.' }, { status: 400 });
            }
            if (!validatedData.address || validatedData.address.length < 5) {
                return NextResponse.json({ error: 'Address is required and must be at least 5 characters long for new profiles.' }, { status: 400 });
            }
        }

        const companyProfile = await db.companyProfile.upsert({
            where: { userId: session.user.id },
            update: validatedData,
            create: {
                userId: session.user.id,
                // We've already validated these are present if it's a create operation
                companyName: validatedData.companyName!,
                address: validatedData.address!,
                ...validatedData,
            },
        });

        return NextResponse.json(companyProfile);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid data format', details: error.flatten().fieldErrors },
                { status: 400 }
            );
        }
        
        console.error('❌ PUT /api/profile/company error:', error);
        return NextResponse.json({ error: 'Server error while updating profile' }, { status: 500 });
    }
}
