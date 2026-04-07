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
 */
export const uploadToCloudinary = async (
  file: File,
  folder: string = 'cv_uploads'
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 🔥 BƯỚC 1: Lấy đuôi file (ví dụ: "pdf", "docx") từ tên file gốc
  const extension = file.name.split('.').pop();
  
  // 🔥 BƯỚC 2: Tạo một cái tên file chống trùng lặp, BẮT BUỘC PHẢI CHỨA ĐUÔI FILE
  const uniqueFilename = `cv_${Date.now()}_${Math.random().toString(36).substring(7)}.${extension}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'raw', 
        public_id: uniqueFilename, // 🔥 BƯỚC 3: Truyền tên file có đuôi vào đây
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error("Cloudinary upload failed:", error);
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url); 
        }
      }
    );

    uploadStream.end(buffer);
  });
};

export default cloudinary;