import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { NextRequest, NextResponse } from 'next/server';

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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'HR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const companyName = formData.get("companyName") as string;
    const address = formData.get("address") as string;
    const website = formData.get("website") as string;
    const description = formData.get("description") as string;
    
    // 🔥 FIX LỖI Ở ĐÂY: Prisma yêu cầu 'size' là String, nên ta giữ nguyên nó là String
    const size = formData.get("size") as string || null;
    
    // Giữ nguyên Number cho foundedYear (năm thành lập thường là Int)
    const foundedYearRaw = formData.get("foundedYear");
    const foundedYear = foundedYearRaw ? Number(foundedYearRaw) : null;

    const logoFile = formData.get("logo") as File | null;
    let logoUrl = undefined; 

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadToCloudinary(logoFile, 'company_logos');
    }

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

    const updateData: any = {
      companyName: companyName || existingProfile?.companyName,
      address: address || existingProfile?.address,
      website: website || null,
      description: description || null,
      size: size, // Lưu thẳng String vào DB
      foundedYear: foundedYear,
    };

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
        size: size,
        foundedYear: foundedYear,
        logoUrl: logoUrl || null,
      },
    });

    return NextResponse.json(companyProfile, { status: 200 });

  } catch (error) {
    console.error('❌ Lỗi PUT /api/profile/company:', error);
    return NextResponse.json({ error: 'Lỗi server khi cập nhật hồ sơ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}