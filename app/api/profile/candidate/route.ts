import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await db.candidateProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(profile || null);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // 1. LẤY DỮ LIỆU TỪ FORM
    const address = formData.get('address') as string;
    const skills = formData.get('skills') as string;
    const bio = formData.get('bio') as string;
    const avatarFile = formData.get('avatar') as File | null;
    const cvFile = formData.get('cv') as File | null;
    const phone = formData.get('phone') as string;

    let imageUrl = session.user.image; // Mặc định giữ ảnh cũ
    let cvUrl = undefined;

    // 2. GỌI HÀM HELPER ĐỂ UPLOAD FILE (Cực kỳ ngắn gọn)
    if (avatarFile && avatarFile.size > 0) {
      imageUrl = await uploadToCloudinary(avatarFile, "blue_ocean_avatars");
    }

    if (cvFile && cvFile.size > 0) {
      cvUrl = await uploadToCloudinary(cvFile, "blue_ocean_cvs");
    }

    // 3. CẬP NHẬT VÀO BẢNG CANDIDATE PROFILE
    const candidateProfile = await db.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: {
        address,
        skills,
        bio,
        ...(cvUrl && { defaultCvUrl: cvUrl }), // Chỉ ghi đè nếu có link CV mới
      },
      create: {
        userId: session.user.id,
        address,
        skills,
        bio,
        defaultCvUrl: cvUrl || null,
      },
    });

    // 4. CẬP NHẬT VÀO BẢNG USER (Để avatar đổi trên toàn hệ thống)
    if (imageUrl && imageUrl !== session.user.image) {
      await db.user.update({
        where: { id: session.user.id },
        data: { image: imageUrl }
      });
    }
    await db.user.update({
  where: { id: session.user.id },
  data: { 
    ...(imageUrl && imageUrl !== session.user.image ? { image: imageUrl } : {}),
    ...(phone ? { phone: phone } : {}) 
  }
});

    return NextResponse.json({ success: true, data: candidateProfile, imageUrl });

  } catch (error: any) {
    console.error('❌ Lỗi POST /api/profile/candidate:', error);
    return NextResponse.json(
      { error: 'Không thể cập nhật hồ sơ', details: error.message },
      { status: 500 }
    );
  }
}