# 📁 Cấu Trúc Dự Án Recruitment System

## 🎯 Mục Lục
1. [Config Files](#config-files)
2. [App Router (Next.js)](#app-router)
3. [Components](#components)
4. [Library & Utils](#library--utils)
5. [Database & Schema](#database--schema)
6. [Documentation](#documentation)

---

## 📄 Config Files

```
recruitment-system/
├── .env                                    # Biến môi trường (DATABASE_URL, NEXTAUTH_*, CLOUDINARY_*)
├── .env.example                            # Mẫu .env cho người phát triển mới
├── .gitignore                              # Ignore các file không cần commit
├── .prettierrc                             # Cấu hình code formatter (Prettier)
├── eslint.config.mjs                       # Cấu hình linter JavaScript/TypeScript
├── next.config.ts                          # Cấu hình Next.js 16
├── next-env.d.ts                           # TypeScript definitions cho Next.js
├── tsconfig.json                           # Cấu hình TypeScript
├── postcss.config.mjs                      # Cấu hình PostCSS (Tailwind CSS)
├── package.json                            # Dependencies & scripts
├── middleware.ts                           # NextAuth middleware (bảo vệ routes)
├── README.md                               # Tài liệu dự án
└── LICENSE                                 # Giấy phép MIT
```

---

## 🚀 App Router (App Directory - Next.js 16)

### Cấu trúc chính:
```
app/
├── globals.css                             # CSS toàn cụ + Tailwind imports
├── layout.tsx                              # Root layout (bao bọc toàn ứng dụng)
│                                          # Chứa: SessionProvider, ToastProvider
```

### Route Groups & Pages:

#### 📌 **(auth) - Nhóm xác thực**
```
app/(auth)/
├── layout.tsx                              # Layout cho auth (clean, no navbar)
├── login/
│   └── page.tsx                            # Trang đăng nhập người dùng
│                                          # - Form input email + password
│                                          # - NextAuth signIn()
│                                          # - Redirect dựa trên role (HR / Candidate)
└── register/
    └── page.tsx                            # Trang đăng ký tài khoản mới
                                           # - Form input name, email, password, role
                                           # - Tạo HR profile / Candidate profile
                                           # - Redirect tới /onboarding nếu HR
```

---

#### 📌 **(dashboard) - Bảo vệ khu vực admin**
```
app/(dashboard)/
├── layout.tsx                              # Root dashboard layout
│                                          # - Kiểm tra auth + role === HR
│                                          # - Render Sidebar + Header
│                                          # - Bao bọc children
├── DashboardNav.tsx                        # Component Navigation
│                                          # - SidebarNav: desktop navigation
│                                          # - MobileNav: mobile bottom navigation
│
├── dashboard/
│   └── page.tsx                            # Trang chủ dashboard (overview)
│                                          # - Cards: Tổng job, ứng viên, lượt xem
│                                          # - Danh sách job gần đây
│                                          # - Nút "Tạo job mới"
│
├── admin-jobs/                             # Quản lý việc làm (HR)
│   ├── page.tsx                            # Danh sách job để quản lý
│   │                                      # - Hiển thị table: tên, location, status, actions
│   │                                      # - Filter, search
│   │                                      # - Buttons: Edit, View, Delete
│   │
│   ├── new/
│   │   └── page.tsx                        # Form tạo job mới
│   │                                      # - Render EditJobForm component
│   │
│   └── [id]/
│       └── edit/
│           ├── page.tsx                    # Trang edit job
│           │                              # - Render EditJobForm với dữ liệu job
│           │
│           └── (component) EditJobForm.tsx # Form component (dùng lại)
│                                          # - Input: title, company, description, salary
│                                          # - Rich editor cho description
│                                          # - Autosave hoặc manual save
│                                          # - Delete button
│
└── applications/                           # Quản lý đơn ứng tuyển
    ├── page.tsx                            # Danh sách ứng tuyển
    │                                      # - Table: tên ứng viên, job, status, dates
    │                                      # - Filter by job, status
    │                                      # - Click row để xem chi tiết
    │
    └── [id]/
        └── page.tsx                        # Chi tiết ứng tuyển
                                           # - Hồ sơ ứng viên
                                           # - CV viewer
                                           # - Update status dropdown
                                           # - Contact buttons (email, phone)
                                           # - Timeline hoạt động
```

---

#### 📌 **(public) - Khu vực công khai (Ứng viên)**
```
app/(public)/
├── layout.tsx                              # Layout công khai
│                                          # - Navbar với logo + job link + avatar/login
│                                          # - Responsive design
│
├── page.tsx                                # Trang chủ (Home)
│                                          # - Hero section: tagline, CTA
│                                          # - Featured jobs section
│                                          # - Categories: Design & Creative, Tech, Sales...
│                                          # - Top companies showcase
│                                          # - Call-to-action sections
│
├── candidate/
│   └── profile/
│       └── page.tsx                        # Hồ sơ ứng viên
│                                          # - Left sidebar: avatar, nav, completion %
│                                          # - Main: dashboard hoặc form chỉnh sửa
│                                          # - Right sidebar: timeline cá nhân
│                                          # - Recommended jobs
│
├── jobs/                                   # Job listing
│   ├── page.tsx (được render từ DB mà không cần file)
│   │                                      # - Danh sách tất cả job (search, filter)
│   │
│   └── [id]/
│       ├── page.tsx                        # Chi tiết job (public view)
│       │                                  # - Job description, requirements
│       │                                  # - Company info + logo
│       │                                  # - Similar jobs recommendation
│       │                                  # - Apply button / Applied badge
│       │
│       └── apply/
│           └── page.tsx                    # Form ứng tuyển
│                                          # - Upload CV
│                                          # - Cover letter (optional)
│                                          # - Confirm & submit
└── index.tsx (component)                   # (được import từ ui/)
```

---

#### 📌 **api/ - API Routes (Backend)**
```
app/api/

# Auth & Registration
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts                        # NextAuth v5 handler
│   │                                      # - Endpoints: /api/auth/signin, /signout, /callback
│   │
│   └── register/
│       └── route.ts                        # Custom register endpoint
│                                          # POST: tạo user mới + hash password
│                                          # Return: { success, data: user }

# Job Management
├── jobs/
│   ├── route.ts                            # GET: danh sách job (pagination, filter)
│   │                                      # POST: tạo job mới (yêu cầu auth HR)
│   │                                      # Query: ?limit=10&skip=0&search=
│   │
│   └── [id]/
│       └── route.ts                        # GET: chi tiết job
│                                          # PUT: cập nhật job (HR only)
│                                          # DELETE: xóa job (HR only)

# Applications Management
├── applications/
│   ├── route.ts                            # GET: danh sách ứng tuyển (HR)
│   │                                      # POST: tạo ứng tuyển mới (Candidate)
│   │
│   ├── [id]/
│   │   ├── route.ts                        # GET: chi tiết ứng tuyển
│   │   │                                  # PUT: cập nhật ứng tuyển
│   │   │                                  # DELETE: xóa ứng tuyển
│   │   │
│   │   └── status/
│   │       └── route.ts                    # PUT: cập nhật status ứng tuyển
│   │                                      # Body: { status: "pending" | "interview" }
│   │
│   └── my/
│       └── route.ts                        # GET: danh sách ứng tuyển của user hiện tại
│                                          # (Candidate xem đơn của mình)

# Profile Management
└── profile/
    ├── candidate/
    │   └── route.ts                        # GET/PUT: hồ sơ ứng viên
    │                                      # Body: { skills, bio, address, defaultCvUrl }
    │
    └── company/
        └── route.ts                        # GET/PUT: hồ sơ công ty (HR)
                                           # Body: { companyName, website, logoUrl }
```

---

## 🎨 Components

### Cấu trúc Components:
```
components/

├── forms/
│   ├── EditJobForm.tsx                     # Form chỉnh sửa/tạo job
│   │                                      # - Fields: title, company, salary, description
│   │                                      # - Rich text editor
│   │                                      # - Auto-save hoặc submit button
│   │
│   └── CandidateEditForm.tsx               # Form chỉnh sửa hồ sơ ứng viên
│                                          # - Fields: skills, bio, address, CV upload
│                                          # - File validation
│                                          # - Submit API call

├── providers/
│   ├── session-provider.tsx                # NextAuth SessionProvider
│   │                                      # - Bao bọc app để cung cấp session
│   │
│   └── toast-provider.tsx                  # React Hot Toast Provider
│                                          # - Toast notifications system

└── ui/                                     # Reusable UI Components
    ├── button.tsx                          # Button component (styled with Tailwind)
    ├── input.tsx                           # Input text component
    ├── label.tsx                           # Form label
    ├── textarea.tsx                        # Textarea (dài)
    ├── file-input.tsx                      # File upload input
    │                                      # - Validation: type, size
    │                                      # - Accept: .pdf, .docx
    │
    ├── confirm-modal.tsx                   # Modal xác nhận hành động
    │                                      # - Danger: delete, reject
    │                                      # - Info: quay lại
    │
    └── status-badge.tsx                    # Badge hiển thị trạng thái
                                           # - Colors: pending, interview, accepted, rejected
```

---

## 📚 Library & Utils

```
lib/

├── auth.ts                                 # NextAuth configuration
│                                          # - Providers: credentials
│                                          # - Callbacks: jwt, session, signIn
│                                          # - Pages: signIn, error
│
├── db.ts                                   # Prisma Client singleton
│                                          # - Export db instance
│
├── cloudinary.ts                           # Cloudinary upload helper
│                                          # - Upload image/file
│                                          # - Delete file
│
└── validations.ts                          # Zod validation schemas
                                           # - registerSchema
                                           # - jobSchema
                                           # - applicationSchema
                                           # - profileSchema
                                           # - fileValidation()

utils/

└── cn.ts                                   # Class name merge utility
                                           # - Merge Tailwind classes (clsx + tailwind-merge)
                                           # - Usage: cn("px-2", "px-4") → "px-4"

types/

├── index.ts                                # TypeScript interfaces & types
│                                          # - User, Job, Application
│                                          # - ApplicationStatus, JobStatus
│                                          # - ApiResponse<T>
│
└── index.d.ts                              # ❌ DEPRECATED (file rỗng, đã xóa)
```

---

## 🗄️ Database & Schema

```
prisma/

└── schema.prisma                           # Database schema (ORM definition)
                                           # Models:
                                           #   - User (id, email, name, role, etc)
                                           #   - Job (id, title, company, description, etc)
                                           #   - Application (id, userId, jobId, status, etc)
                                           #   - CompanyProfile (HR profile)
                                           #   - CandidateProfile (Candidate hồ sơ)
                                           #
                                           # Relationships:
                                           #   - User → CompanyProfile (1:1)
                                           #   - User → CandidateProfile (1:1)
                                           #   - User → Job (1:many)
                                           #   - User → Application (1:many)
                                           #   - Job → Application (1:many)
```

---

## 📖 Documentation

```
docs/

├── API.md                                  # API documentation
│                                          # - Endpoints chi tiết
│                                          # - Request/Response examples
│                                          # - Authentication headers
│
├── USER_STORIES.md                         # Yêu cầu người dùng
│                                          # - Scenarios: HR, Candidate
│                                          # - Features & use cases
│
└── PROJECT_STRUCTURE.md (file này)         # Cấu trúc dự án dạng readable
```

---

## 📁 Public Assets

```
public/

└── (rỗng - chứa static files khi cần)
                                           # Có thể thêm: logo, favicon, icons
```

---

## 🔍 Flow Nhập/Xuất Dữ Liệu

### **Luồng HR (Admin)**
```
/login → Verify credentials → /dashboard
  ↓
/admin-jobs → Create job → /admin-jobs/[id]/edit → API POST /jobs
  ↓
/applications → View applicants → /applications/[id] → Update status
  ↓
API PUT /applications/[id]/status
```

### **Luồng Ứng Viên (Candidate)**
```
/ → /jobs → /jobs/[id] → Apply
  ↓
API POST /applications (upload CV)
  ↓
/candidate/profile → View applications
  ↓
API GET /applications/my
```

---

## ✅ Checklist File Penting

- ✅ `.env` - Cấu hình môi trường
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `lib/auth.ts` - Authentication logic
- ✅ `middleware.ts` - Route protection
- ✅ `app/layout.tsx` - Root providers
- ✅ `components/ui/*` - Reusable components
- ✅ `types/index.ts` - Type definitions
- ✅ `lib/validations.ts` - Zod schemas

---

## 🚀 Cách Chạy Dự Án

```bash
# 1. Install dependencies
npm install

# 2. Setup .env
cp .env.example .env
# Edit .env với DATABASE_URL, NEXTAUTH_SECRET, etc

# 3. Run migrations
npx prisma migrate dev

# 4. Start dev server
npm run dev

# 5. Open http://localhost:3000
```

---

**Last Updated:** March 2026
**Tech Stack:** Next.js 16, React 19, TypeScript, Prisma, NextAuth, Tailwind CSS
