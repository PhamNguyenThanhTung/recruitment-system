# Tài liệu API - Hệ Thống Tuyển Dụng
*Cập nhật: Sprint 1 (Tuần 3-4)*
---

## 🔒 1. Module Auth (Xác thực) - [TÙNG PHỤ TRÁCH]
**Lưu ý quan trọng cho Backend:** Dự án sử dụng `NextAuth.js`. Backend KHÔNG CẦN viết các API Login/Register thủ công. 
* NextAuth sẽ tự động bọc các endpoint tại route: `/api/auth/[...nextauth]`
* Token và Session sẽ do NextAuth quản lý nội bộ.
* *Nhiệm vụ của Bắc:* Chỉ cần đảm bảo DB có bảng `users` chuẩn để NextAuth lưu trữ dữ liệu là được.

---

## 💼 2. Module Jobs (Tin tuyển dụng) - [BẮC PHỤ TRÁCH]
Đây là trọng tâm code của Sprint 1.

### Lấy danh sách việc làm
* **URL:** `/api/jobs`
* **Method:** `GET`
* **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "1",
          "title": "Frontend Developer",
          "company": "Tech Corp",
          "location": "Hà Nội",
          "salary": "15-20M",
          "createdAt": "2026-03-20T10:00:00Z"
        }
      ]
    }
    ```

### Lấy chi tiết một việc làm
* **URL:** `/api/jobs/:id`
* **Method:** `GET`
* **Response (200 OK):** Trả về object chi tiết của Job.

### Đăng tin tuyển dụng mới (Yêu cầu HR đăng nhập)
* **URL:** `/api/jobs`
* **Method:** `POST`
* **Body:**
    ```json
    {
      "title": "Backend Developer (Node.js)",
      "description": "Mô tả công việc chi tiết...",
      "requirements": "Yêu cầu ứng viên...",
      "salary": "Up to 30M",
      "location": "TP.HCM",
      "deadline": "2026-04-30"
    }
    ```
* **Response (201 Created):** Trả về Job vừa tạo.

### Cập nhật tin tuyển dụng (Chỉ HR tạo tin mới được sửa)
* **URL:** `/api/jobs/:id`
* **Method:** `PUT`
* **Body:** Chứa các trường cần update (giống POST).
* **Response (200 OK):** Trả về Job sau khi cập nhật.

### Xóa tin tuyển dụng (Chỉ HR tạo tin mới được xóa)
* **URL:** `/api/jobs/:id`
* **Method:** `DELETE`
* **Response (200 OK):** `{"success": true, "message": "Xóa thành công"}`

---

## 🚀 BACKLOG CHO CÁC SPRINT SAU (ĐANG ĐÓNG BĂNG)
*Team KHÔNG code các API này trong Sprint 1 để đảm bảo đúng tiến độ.*

* **Sprint 2:** `POST /api/applications` (Nộp CV), `GET /api/applications` (HR xem danh sách đơn).
* **Sprint 3:** `PUT /api/applications/:id/status` (HR đổi trạng thái đơn), `POST /api/interviews` (Lên lịch phỏng vấn).