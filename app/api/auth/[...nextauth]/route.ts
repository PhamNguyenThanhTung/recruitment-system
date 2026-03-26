import { handlers } from "@/lib/auth";

/**
 * Xuất các hàm xử lý HTTP GET và POST từ NextAuth handlers.
 * Route này xử lý các yêu cầu liên quan đến xác thực như đăng nhập, đăng xuất, v.v.
 */
export const { GET, POST } = handlers;
