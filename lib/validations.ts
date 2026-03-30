import { z } from 'zod';
import { ApplicationStatus, JobStatus } from '@prisma/client';

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
  status: z.nativeEnum(ApplicationStatus),
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
  status: z.nativeEnum(JobStatus).default(JobStatus.DRAFT),
});

/**
 * Schema xác thực hồ sơ công ty (Company Profile) - Dành cho HR (Creation)
 */
export const companyProfileSchema = z.object({
  companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự'),
  address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  website: z.string().url('Website phải là URL hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
});

/**
 * Schema xác thực cập nhật hồ sơ công ty (Company Profile) - Dành cho HR
 */
export const updateCompanyProfileSchema = z.object({
    companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự').optional(),
    address: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự').optional(),
    website: z.string().url('Website phải là URL hợp lệ').optional().or(z.literal('')),
    description: z.string().optional(),
    logoUrl: z.string().url('Logo phải là URL hợp lệ').optional(),
    size: z.string().optional(),
    foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
});

/**
 * Schema xác thực hồ sơ ứng viên (Candidate Profile) - Dành cho Candidate
 */
const educationItemSchema = z.object({
  degree: z.string(),
  school: z.string(),
  year: z.string(),
});

const experienceItemSchema = z.object({
  title: z.string(),
  company: z.string(),
  from: z.string(),
  to: z.string().optional(),
  description: z.string().optional(),
});

export const updateCandidateProfileSchema = z.object({
  skills: z.string().optional(),
  education: z.array(educationItemSchema).optional(),
  experience: z.array(experienceItemSchema).optional(),
  bio: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Avatar phải là URL hợp lệ').optional(),
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
export type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema>;
export type CandidateProfileInput = z.infer<typeof updateCandidateProfileSchema>;
