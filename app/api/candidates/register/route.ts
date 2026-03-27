import { db } from '@/lib/db';
import { candidateRegisterSchema } from '@/lib/validations';
import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';

/**
 * POST /api/candidates/register
 * Endpoint đăng ký tài khoản Candidate mới
 * 
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   name: string,
 *   phone?: string
 * }
 * 
 * Response: 201 Created - { id, email, name, role }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Xác thực input
    const validatedData = candidateRegisterSchema.parse(body);

    // Kiểm tra email đã tồn tại
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được đăng ký' },
        { status: 409 } // 409 Conflict
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Tạo user mới với role CANDIDATE
    const user = await db.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
        ...(validatedData.phone && { phone: validatedData.phone }),
        role: 'CANDIDATE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.message },
        { status: 400 }
      );
    }

    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Lỗi server khi đăng ký' },
      { status: 500 }
    );
  }
}
