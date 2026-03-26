import { PrismaClient } from "@prisma/client";

/**
 * Hàm khởi tạo đối tượng PrismaClient.
 * PrismaClient cung cấp các API để tương tác với cơ sở dữ liệu.
 */
const prismaClientSingleton = () => {
  return new PrismaClient();
};

/**
 * Khai báo biến toàn cục 'prisma' để tránh việc khởi tạo nhiều instance của PrismaClient
 * trong quá trình phát triển (Next.js hot reloading).
 */
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

/**
 * Sử dụng đối tượng prisma đã tồn tại trong phạm vi toàn cục hoặc khởi tạo một cái mới.
 */
export const db = globalThis.prisma ?? prismaClientSingleton();

/**
 * Trong môi trường phát triển (development), lưu instance của PrismaClient vào biến toàn cục.
 */
if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
