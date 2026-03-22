## Auth
POST   /api/auth/register        → Đăng ký tài khoản ứng viên
POST   /api/auth/login           → Đăng nhập (NextAuth)

## Jobs
GET    /api/jobs                 → Danh sách tin tuyển dụng (Public)
GET    /api/jobs/:id             → Chi tiết 1 tin (Public)
POST   /api/jobs                 → Tạo tin mới (HR)
PUT    /api/jobs/:id             → Sửa tin (HR)
DELETE /api/jobs/:id             → Xóa/đóng tin (HR)

## Applications
POST   /api/applications                  → Nộp đơn + upload CV (Candidate)
GET    /api/applications                  → Danh sách đơn (HR)
GET    /api/applications/me               → Đơn của tôi (Candidate)
PATCH  /api/applications/:id/status       → Đổi trạng thái đơn (HR)

## Interviews (Should-have)
POST   /api/interviews                    → Tạo lịch phỏng vấn (HR)
GET    /api/interviews/:id                → Chi tiết lịch (HR/Interviewer)
PATCH  /api/interviews/:id/score          → Nhập điểm đánh giá (Interviewer)