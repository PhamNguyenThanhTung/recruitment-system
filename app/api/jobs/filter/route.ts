import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    // === 1. LẤY VÀ XỬ LÝ QUERY PARAMETERS ===
    const searchParams = request.nextUrl.searchParams;

    const q = searchParams.get("q")?.trim() || "";
    const location = searchParams.get("location")?.trim() || "";
    const jobType = searchParams.get("jobType")?.trim() || "";
    
    // 🔥 SỬA CHỖ NÀY: Parse an toàn cho số VNĐ (để tránh lỗi NaN khi giá trị rỗng)
    const minSalaryStr = searchParams.get("minSalary");
    const maxSalaryStr = searchParams.get("maxSalary");
    const minSalary = minSalaryStr ? parseInt(minSalaryStr, 10) : null;
    const maxSalary = maxSalaryStr ? parseInt(maxSalaryStr, 10) : null;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));

    // === 2. XÂY DỰNG WHERE CONDITIONS (CHỈ CHO DB) ===
    const where: Prisma.JobWhereInput = {
      status: "OPEN", 
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { company: { contains: q, mode: "insensitive" } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (jobType) {
      where.jobType = jobType as any; 
    }

    // 🔥 Dùng số nguyên (Int) trực tiếp từ DB để lọc VNĐ chính xác
    if (minSalary !== null && !isNaN(minSalary)) {
      where.minSalary = { gte: minSalary };
    }

    if (maxSalary !== null && !isNaN(maxSalary)) {
      where.maxSalary = { lte: maxSalary };
    }

    // === 3. KÉO DỮ LIỆU TỪ DB ===
    const rawJobs = await db.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        salary: true, // Vẫn lấy chuỗi "10.000.000 VNĐ" để hiển thị trên UI
        minSalary: true,
        maxSalary: true,
        location: true,
        jobType: true,
        deadline: true,
        status: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.job.count({ where });
    const totalPages = Math.ceil(total / limit);

    // === 4. TRẢ VỀ RESPONSE ===
    return NextResponse.json(
      {
        data: rawJobs,
        meta: {
          total,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Jobs Filter] Error:", error);
    return NextResponse.json(
      {
        error: "Lỗi khi lấy danh sách công việc.",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
