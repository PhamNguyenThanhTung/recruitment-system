import { z } from 'zod';

/**
 * Schema xác thực đăng ký tài khoản (HR)
 */
export const registerSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
});

/**
 * Schema xác thực đăng ký tài khoản Candidate
 */
export const candidateRegisterSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
});

/**
 * Schema xác thực trạng thái ứng tuyển
 */
export const applicationStatusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'interview', 'accepted', 'rejected']),
});

/**
 * Schema xác thực tạo/cập nhật tin tuyển dụng
 */
export const jobSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  company: z.string().optional(), // ✅ THÀNH OPTIONAL - backend sẽ tự động lấy từ CompanyProfile
  description: z.string().min(10, 'Mô tả phải có ít nhất 10 ký tự'),
  requirements: z.string().optional(),
  salary: z.string().optional(),
  location: z.string().optional(), // ✅ THÀNH OPTIONAL - backend sẽ tự động lấy từ CompanyProfile
  deadline: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  status: z.enum(['Draft', 'Open', 'Closed']).default('Draft'),
});

/**
 * Schema xác thực hồ sơ công ty (Company Profile) - Dành cho HR
 */
export const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  website: z.string().url('Website phải là URL hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
});

/**
 * Schema xác thực hồ sơ ứng viên (Candidate Profile) - Dành cho Candidate
 */
export const candidateProfileSchema = z.object({
  address: z.string().optional(),
  skills: z.string().optional(),
  bio: z.string().optional(),
});

/**
 * Xác thực file CV
 * @param file - File object từ input
 * @returns true nếu file hợp lệ
 * @throws Error nếu file không hợp lệ
 */
export const fileValidation = (file: File) => {
  // Giới hạn kích thước file: 4MB (tránh lỗi 413 trên Vercel)
  const maxSize = 4 * 1024 * 1024; // 4MB
  
  // Chỉ cho phép PDF và DOCX
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (file.size > maxSize) {
    throw new Error('Kích thước file không được vượt quá 4MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Chỉ cho phép file PDF hoặc DOCX');
  }

  return true;
};

// Export loại types từ schemas
export type RegisterInput = z.infer<typeof registerSchema>;
export type CandidateRegisterInput = z.infer<typeof candidateRegisterSchema>;
export type ApplicationStatusInput = z.infer<typeof applicationStatusSchema>;
export type JobInput = z.infer<typeof jobSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type CandidateProfileInput = z.infer<typeof candidateProfileSchema>;
