import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

/**
 * Cấu hình Cloudinary
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Hàm tải file lên Cloudinary
 * NÂNG CẤP: Nhận trực tiếp đối tượng `File` từ FormData của Next.js
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'cv_uploads'
): Promise<string> => {
  // 1. Chuyển đổi File sang Buffer ngay tại đây để API Route gọn gàng hơn
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Tự động nhận diện ảnh hoặc file PDF
      },
      // 2. FIX LỖI "ANY": Import và sử dụng type chính chủ từ Cloudinary
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary upload failed:", error);
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url); // Trả về link HTTPS
        }
      }
    );

    // Gửi buffer tới upload stream
    uploadStream.end(buffer);
  });
};

export default cloudinary;