import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Hàm tiện ích 'cn' (class name) dùng để kết hợp các lớp CSS (Tailwind classes).
 * 'clsx' giúp xử lý các điều kiện để thêm class.
 * 'twMerge' giúp giải quyết các xung đột giữa các lớp Tailwind (ví dụ: px-2 và px-4).
 * 
 * @param inputs: Danh sách các class hoặc điều kiện class.
 * @returns Chuỗi các class đã được tối ưu hóa.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
