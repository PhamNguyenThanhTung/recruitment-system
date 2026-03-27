# 🏢 Hệ Thống Quản Lý Tuyển Dụng Nhân Sự

Đồ án môn Công Nghệ Phần Mềm — Nhóm [số nhóm]

## 🛠️ Tech Stack
- **Framework:** Next.js 16.2 (App Router)
- **Styling:** Tailwind CSS v4, Lucide React
- **Auth:** NextAuth.js v5 (Auth.js)
- **ORM:** Prisma 5.22.0 (Stable version)
- **Database:** Supabase (PostgreSQL) - IPv4 Session Pooler (Port 5432)
- **Validation:** Zod
- **File Upload:** Cloudinary

---

## 🚀 BẢN TÓM TẮT KỸ THUẬT SPRINT 1 (AUTH & JOBS)

### 1. Cấu trúc File & Quy hoạch Route Group
Dự án đã được quy hoạch lại Route Group để tách biệt hoàn toàn luồng quản lý của HR và luồng xem tin của ứng viên:

- **Auth (Xác thực):**
  - `app/(auth)/login/page.tsx`: Trang đăng nhập.
  - `app/(auth)/register/page.tsx`: Trang đăng ký tài khoản HR.
  - `app/api/auth/[...nextauth]/route.ts`: Handler cho NextAuth v5.
  - `app/api/auth/register/route.ts`: API đăng ký người dùng mới.

- **Admin Dashboard (Quản lý cho HR):**
  - `app/(dashboard)/layout.tsx`: Layout chung cho Dashboard (Sidebar/Header).
  - `app/(dashboard)/admin-jobs/page.tsx`: Danh sách tin tuyển dụng của HR (**Route mới: /admin-jobs**).
  - `app/(dashboard)/admin-jobs/new/page.tsx`: Form đăng tin tuyển dụng mới.
  - `app/(dashboard)/admin-jobs/[id]/edit/page.tsx`: Trang chỉnh sửa/xóa tin tuyển dụng.

- **Public (Dành cho khách/ứng viên):**
  - `app/(public)/page.tsx`: Trang chủ (/) với logic tìm kiếm việc làm theo từ khóa.
  - `app/(public)/jobs/[id]/page.tsx`: Trang chi tiết tin tuyển dụng public.

- **Core & Shared:**
  - `lib/auth.ts`: Cấu hình NextAuth v5 (xử lý Session, JWT, Role).
  - `lib/db.ts`: Cấu hình Prisma Client (Singleton).
  - `prisma/schema.prisma`: Định nghĩa Schema cơ sở dữ liệu.
  - `components/ui/`: Các UI Components dùng chung (Button, Input, Label).
  - `utils/cn.ts`: Utility hỗ trợ merge Tailwind classes.

### 2. Thực thi Backend & Database
- **Prisma ORM:** Đã thiết lập `schema.prisma` với 2 Model chính:
  - `User`: Chứa email, password (hashed), name, role (mặc định 'HR'), image.
  - `Job`: Chứa title, company, description, requirements, salary, location, deadline, status (Draft/Open/Closed).
- **Kết nối Database:** Đồng bộ thành công với Supabase qua **IPv4 Session Pooler (Port 5432)**.
- **API Logic:**
  - Hoàn thiện luồng Đăng ký/Đăng nhập bảo mật (Bcrypt hashing).
  - Hoàn thiện đầy đủ logic CRUD (Create, Read, Update, Delete) cho Jobs với phân quyền: Chỉ HR tạo tin mới có quyền sửa/xóa tin đó.
  - Tối ưu hóa API theo chuẩn Next.js 16 (Xử lý `params` và `searchParams` dưới dạng Promise).

### 3. Thực thi Frontend
- **UI Components:** Đã xây dựng bộ thành phần giao diện cơ bản (Button, Input, Label) tương thích hoàn toàn với Tailwind CSS v4 và Dark Mode.
- **Logic Trang (Pages):**
  - **Login/Register:** Gắn logic API, thông báo lỗi real-time.
  - **Admin Dashboard:** Giao diện dạng bảng (Table) quản lý tin tuyển dụng chuyên nghiệp.
  - **Public Home:** Tích hợp thanh Search hoạt động trực tiếp với Database qua query params.
  - **Job Detail:** Hiển thị đầy đủ thông tin mô tả và yêu cầu công việc.

### 4. Trạng thái hiện tại (Current Status)
- ✅ **Logic Code:** Hoàn thiện 100% theo thiết kế Sprint 1.
- ✅ **Database:** Đã đồng bộ Schema lên Supabase Cloud.
- ✅ **Tính năng Auth:** Đã thông luồng Session và phân quyền Middleware.
- 🚧 **Giai đoạn:** Đang thực hiện **Kiểm thử nội bộ (Internal Testing)** và chuẩn bị Deploy bản Prototype lên Vercel để hoàn tất DoD (Definition of Done).

---

## 🚀 Cách chạy dự án
```bash
# 1. Cài dependencies
npm install --legacy-peer-deps

# 2. Cấu hình .env (Liên hệ Lead để lấy thông tin)
# AUTH_SECRET, DATABASE_URL, etc.

# 3. Đồng bộ Database
npx prisma generate
npx prisma db push

# 4. Chạy dev server
npm run dev
```
