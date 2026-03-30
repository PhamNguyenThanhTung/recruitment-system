import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { updateCandidateProfileSchema } from '@/lib/validations';
import { z } from 'zod';

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

// --- PUT: Cập nhật thông tin dạng JSON (Bio, Skills, Education, Experience) ---
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateCandidateProfileSchema.parse(body);

    const { avatarUrl, phone, ...profileData } = validatedData;

    // 1. Upsert Profile (Bao gồm cả Education/Experience dạng JSON)
    const candidateProfile = await db.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: { ...profileData, ...(avatarUrl && { avatarUrl }) },
      create: { userId: session.user.id, ...profileData, ...(avatarUrl && { avatarUrl }) },
    });

    // 2. Cập nhật User (Gộp Avatar và Phone vào 1 lần gọi duy nhất)
    if (avatarUrl || phone) {
      await db.user.update({
        where: { id: session.user.id },
        data: {
          ...(avatarUrl && { image: avatarUrl }),
          ...(phone && { phone: phone }),
        },
      });
    }

    return NextResponse.json({ success: true, data: candidateProfile });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ', details: error.flatten().fieldErrors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Lỗi server', details: error.message }, { status: 500 });
  }
}

// --- POST: Xử lý Upload File (Avatar & CV) từ FormData ---
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'CANDIDATE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;
    const cvFile = formData.get('cv') as File | null;
    const phone = formData.get('phone') as string;

    let imageUrl = undefined;
    let cvUrl = undefined;

    // Upload lên Cloudinary
    if (avatarFile && avatarFile.size > 0) {
      imageUrl = await uploadToCloudinary(avatarFile, "blue_ocean_avatars");
    }
    if (cvFile && cvFile.size > 0) {
      cvUrl = await uploadToCloudinary(cvFile, "blue_ocean_cvs");
    }

    // Cập nhật Profile
    const candidateProfile = await db.candidateProfile.upsert({
      where: { userId: session.user.id },
      update: { 
        address: formData.get('address') as string,
        skills: formData.get('skills') as string,
        bio: formData.get('bio') as string,
        ...(cvUrl && { defaultCvUrl: cvUrl }) 
      },
      create: {
        userId: session.user.id,
        address: formData.get('address') as string,
        skills: formData.get('skills') as string,
        bio: formData.get('bio') as string,
        defaultCvUrl: cvUrl || null,
      },
    });

    // 🔥 GỘP LẠI: Chỉ gọi update User 1 lần duy nhất
    if (imageUrl || phone) {
      await db.user.update({
        where: { id: session.user.id },
        data: { 
          ...(imageUrl && { image: imageUrl }),
          ...(phone && { phone: phone }) 
        }
      });
    }

    return NextResponse.json({ success: true, data: candidateProfile });
  } catch (error: any) {
    return NextResponse.json({ error: 'Không thể upload', details: error.message }, { status: 500 });
  }
}