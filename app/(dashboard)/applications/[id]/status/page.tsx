import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ApplicationStatus } from "@prisma/client";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    // 1. Kiểm tra quyền: Phải là HR mới được đổi trạng thái
    if (!session?.user || session.user.role !== "HR") {
      return new NextResponse("Bạn không có quyền này", { status: 401 });
    }

    // 2. Lấy status mới từ body gửi lên
    const body = await req.json();
    const { status } = body;

    // 3. Kiểm tra xem status gửi lên có hợp lệ (khớp với Enum) không
    if (!Object.values(ApplicationStatus).includes(status)) {
      return new NextResponse("Trạng thái không hợp lệ", { status: 400 });
    }

    // 4. Cập nhật vào Database
    const updatedApplication = await db.application.update({
      where: { id },
      data: { status: status as ApplicationStatus },
    });

    // TODO: Gửi email thông báo cho ứng viên ở đây (nếu sếp muốn)

    return NextResponse.json(updatedApplication);
  } catch (error) {
    console.error("[APPLICATION_STATUS_PATCH]", error);
    return new NextResponse("Lỗi server nội bộ", { status: 500 });
  }
}