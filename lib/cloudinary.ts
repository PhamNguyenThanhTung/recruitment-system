import { v2 as cloudinary } from 'cloudinary';

/**
 * Cấu hình Cloudinary bằng các biến môi trường
 * CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Hàm tải file lên Cloudinary
 * @param fileBuffer - Buffer của file cần tải
 * @param folder - Thư mục trên Cloudinary (mặc định: cv_uploads)
 * @returns Promise trả về URL của file đã tải
 * @throws Error nếu quá trình tải thất bại
 */
export const uploadToCloudinary = (
  fileBuffer: Buffer,
  folder: string = 'cv_uploads'
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // Tự động xác định kiểu resource
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
        } else {
          resolve(result.secure_url); // Trả về URL an toàn (HTTPS)
        }
      }
    );

    // Gửi buffer tới upload stream
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
