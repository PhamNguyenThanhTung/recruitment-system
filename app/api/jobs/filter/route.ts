import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * GET /api/jobs/filter
 * 
 * Query Parameters:
 * - q: string (keyword tìm kiếm trong title hoặc company)
 * - location: string (địa điểm làm việc)
 * - jobType: string (loại công việc: FULL_TIME, PART_TIME, CONTRACT, FREELANCE, INTERNSHIP)
 * - minSalary: number (lương tối thiểu)
 * - maxSalary: number (lương tối đa)
 * - page: number (trang hiện tại, default 1)
 * - limit: number (số bản ghi mỗi trang, default 10)
 * 
 * Response:
 * {
 *   data: Job[],
 *   meta: {
 *     total: number,
 *     totalPages: number,
 *     currentPage: number,
 *     limit: number
 *   }
 * }
 */
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

    console.log("[Jobs Filter] Query params:", {
      q,
      location,
      jobType,
      minSalary,
      maxSalary,
      page,
      limit,
    });

    // === 2. XÂY DỰNG WHERE CONDITIONS ===
    const where: Prisma.JobWhereInput = {
      status: "Open", // Chỉ lấy các job đang mở
    };

    // Điều kiện tìm kiếm keyword (trong title hoặc company)
    if (q) {
      where.OR = [
        {
          title: {
            contains: q,
            mode: "insensitive",
          },
        },
        {
          company: {
            contains: q,
            mode: "insensitive",
          },
        },
      ];
    }

    // Điều kiện lọc theo địa điểm
    if (location) {
      where.location = {
        contains: location,
        mode: "insensitive",
      };
    }

    // Điều kiện lọc theo loại công việc
    if (jobType) {
      where.jobType = jobType as any; // JobType enum
    }

    // === 3. TÍNH PAGINATION ===
    const skip = (page - 1) * limit;

    // === 4. QUERY DATABASE ===
    // Lấy danh sách job với pagination
    const [jobs, total] = await Promise.all([
      db.job.findMany({
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
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      // Lấy tổng số record để tính pagination
      db.job.count({ where }),
    ]);

    console.log(`[Jobs Filter] Found ${total} jobs, returning ${jobs.length} for page ${page}`);

    // === 5. LỌC THEO LƯƠNG (TRONG APPLICATION CODE) ===
    // Vì salary lưu dạng text, cần parse và filter trong app
    let filteredJobs = jobs;

    if (minSalary !== null || maxSalary !== null) {
      filteredJobs = jobs.filter((job) => {
        if (!job.salary) return false;

        // Cố gắng parse salary - nó có thể là "20M", "20,000,000", "20000000", v.v.
        const salaryNum = parseSalary(job.salary);
        if (salaryNum === null) return false;

        if (minSalary !== null && salaryNum < minSalary) return false;
        if (maxSalary !== null && salaryNum > maxSalary) return false;

        return true;
      });
    }

    // === 6. TÍNH TỔNG SỐ TRANG (dựa trên bộ lọc lương) ===
    const totalPages = Math.ceil(filteredJobs.length / limit);

    // Áp dụng pagination lại cho kết quả sau khi filter lương
    const paginatedJobs = filteredJobs.slice(0, limit);

    // === 7. TRẢ VỀ RESPONSE ===
    return NextResponse.json(
      {
        data: paginatedJobs,
        meta: {
          total: filteredJobs.length,
          totalPages,
          currentPage: page,
          limit,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Jobs Filter] Error:", error);

    // Log chi tiết lỗi
    if (error instanceof Error) {
      console.error("[Jobs Filter] Error message:", error.message);
      console.error("[Jobs Filter] Error stack:", error.stack);
    }

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
 * Hỗ trợ các format: "20M", "20000000", "20,000,000", v.v.
 */
function parseSalary(salary: string): number | null {
  if (!salary) return null;

  // Loại bỏ khoảng trắng
  let cleaned = salary.trim();

  // Nếu có ký tự "M" hoặc "k" ở cuối (VD: "20M", "500k")
  if (cleaned.endsWith("M") || cleaned.endsWith("m")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000_000;
  }

  if (cleaned.endsWith("K") || cleaned.endsWith("k")) {
    const num = parseFloat(cleaned.slice(0, -1));
    return isNaN(num) ? null : num * 1_000;
  }

  // Loại bỏ dấu phẩy và chuyển sang số
  cleaned = cleaned.replace(/,/g, "");
  const num = parseFloat(cleaned);

  return isNaN(num) ? null : num;
}
