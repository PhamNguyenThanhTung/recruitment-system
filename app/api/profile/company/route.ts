import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary'; // 🔥 Import hàm upload của sếp
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/profile/company
 * Lấy thông tin công ty của HR hiện tại
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'HR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyProfile = await db.companyProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(companyProfile || null, { status: 200 });
  } catch (error) {
    console.error('❌ Lỗi GET /api/profile/company:', error);
    return NextResponse.json({ error: 'Không thể tải hồ sơ công ty' }, { status: 500 });
  }
}

/**
 * PUT /api/profile/company
 * Cập nhật hoặc tạo mới hồ sơ công ty (Hỗ trợ FormData & Upload Logo)
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'HR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 🔥 1. ĐỌC DỮ LIỆU TỪ FORMDATA (Thay vì req.json() như cũ)
    const formData = await request.formData();
    
    const companyName = formData.get("companyName") as string;
    const address = formData.get("address") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;
    
    // Ép kiểu số cho size và foundedYear
    const sizeRaw = formData.get("size");
    const size = sizeRaw ? Number(sizeRaw) : undefined;
    
    const foundedYearRaw = formData.get("foundedYear");
    const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : undefined;

    // 🔥 2. XỬ LÝ UPLOAD LOGO (Nếu có)
    const logoFile = formData.get("logo") as File | null;
    let logoUrl = undefined; // Mặc định là undefined để Prisma không ghi đè nếu không có ảnh mới

    if (logoFile && logoFile.size > 0) {
      // Đẩy ảnh lên thư mục 'company_logos' trên Cloudinary
      logoUrl = await uploadToCloudinary(logoFile, 'company_logos');
    }

    // 3. KIỂM TRA VALIDATION CƠ BẢN
    const existingProfile = await db.companyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProfile) {
      if (!companyName || companyName.length < 2) {
        return NextResponse.json({ error: 'Tên công ty phải có ít nhất 2 ký tự.' }, { status: 400 });
      }
      if (!address || address.length < 5) {
        return NextResponse.json({ error: 'Địa chỉ phải có ít nhất 5 ký tự.' }, { status: 400 });
      }
    }

    // 🔥 4. CẬP NHẬT DATABASE
    // Gói dữ liệu lại để update
    const updateData: any = {
      companyName: companyName || existingProfile?.companyName,
      address: address || existingProfile?.address,
      website: website || null,
      description: description || null,
      size: size || null,
      foundedYear: foundedYear || null,
    };

    // Chỉ cập nhật logoUrl nếu có ảnh mới upload thành công
    if (logoUrl) {
      updateData.logoUrl = logoUrl;
    }

    const companyProfile = await db.companyProfile.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: {
        userId: session.user.id,
        companyName: companyName,
        address: address,
        website: website || null,
        description: description || null,
        size: size || null,
        foundedYear: foundedYear || null,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json(companyProfile, { status: 200 });

  } catch (error) {
    console.error('❌ Lỗi PUT /api/profile/company:', error);
    return NextResponse.json({ error: 'Lỗi server khi cập nhật hồ sơ' }, { status: 500 });
  }
}

// Giữ lại POST trỏ về PUT cho an toàn (phòng trường hợp Frontend gọi nhầm method)
export async function POST(request: NextRequest) {
  return PUT(request);
}