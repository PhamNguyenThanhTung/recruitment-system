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
    const minSalary = searchParams.get("minSalary") ? parseInt(searchParams.get("minSalary")!) : null;
    const maxSalary = searchParams.get("maxSalary") ? parseInt(searchParams.get("maxSalary")!) : null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));

    // === 2. XÂY DỰNG WHERE CONDITIONS (CHỈ CHO DB) ===
    const where: Prisma.JobWhereInput = {
      status: "Open", 
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

    // === 3. KÉO DỮ LIỆU TỪ DB (KHÔNG PHÂN TRANG Ở ĐÂY) ===
    // ⚠️ Vì phải lọc lương bằng JS, ta phải kéo toàn bộ data thỏa mãn keyword
    const rawJobs = await db.job.findMany({
      where,
      select: {
        id: true,
        title: true,
        company: true,
        description: true,
        requirements: true,
        salary: true,
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
    });

    // === 4. LỌC THEO LƯƠNG BẰNG JAVASCRIPT ===
    let filteredJobs = rawJobs;

    if (minSalary !== null || maxSalary !== null) {
      filteredJobs = rawJobs.filter((job) => {
        if (!job.salary) return false;

        const salaryNum = parseSalary(job.salary);
        if (salaryNum === null) return false;

        if (minSalary !== null && salaryNum < minSalary) return false;
        if (maxSalary !== null && salaryNum > maxSalary) return false;

        return true;
      });
    }

    // === 5. BÂY GIỜ MỚI XỬ LÝ PHÂN TRANG TRÊN MẢNG ĐÃ LỌC ===
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;
    
    // Cắt mảng (slice) để lấy đúng số record cho trang hiện tại
    const paginatedJobs = filteredJobs.slice(skip, skip + limit);

    // === 6. TRẢ VỀ RESPONSE ===
    return NextResponse.json(
      {
        data: paginatedJobs,
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

/**
 * Helper function: Parse salary string to number
 */
function parseSalary(salary: string): number | null {
  if (!salary) return null;
  let cleaned = salary.trim();

  // Bắt case HR viết lương theo dải, VD: "15M - 20M" -> Lấy số đầu tiên là 15M
  if (cleaned.includes("-")) {
    cleaned = cleaned.split("-")[0].trim();
  }

  if (cleaned.endsWith("M") || cleaned.endsWith("m")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000_000;
  }

  if (cleaned.endsWith("K") || cleaned.endsWith("k")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000;
  }

  cleaned = cleaned.replace(/,/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}