import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const avatarFile = formData.get('avatar') as File | null;

    if (!avatarFile || avatarFile.size === 0) {
      return NextResponse.json(
        { error: 'No avatar file provided' },
        { status: 400 }
      );
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(avatarFile.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, or WEBP images are allowed" }, { status: 400 });
    }

    // Validate size (5MB)
    if (avatarFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    // Reuse the Cloudinary upload helper, specifying the correct folder
    const secure_url = await uploadToCloudinary(avatarFile, 'avatars_uploads');

    // Update the user's image in the database
    await db.user.update({
      where: { id: session.user.id },
      data: { image: secure_url },
    });

    // If the user is a candidate, also update their profile
    if (session.user.role === 'CANDIDATE') {
      await db.candidateProfile.upsert({
        where: { userId: session.user.id },
        update: { avatarUrl: secure_url },
        create: {
          userId: session.user.id,
          avatarUrl: secure_url,
        },
      });
    }

    return NextResponse.json({ success: true, secure_url });

  } catch (error: any) {
    console.error('❌ Lỗi POST /api/upload/avatar:', error);
    return NextResponse.json(
      { error: 'Could not upload avatar', details: error.message },
      { status: 500 }
    );
  }
}
