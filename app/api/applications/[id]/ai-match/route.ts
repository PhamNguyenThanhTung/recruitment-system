import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Khởi tạo Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'HR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // Lấy thông tin Ứng tuyển + Job + Profile
    const application = await db.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: { include: { candidateProfile: true } }
      }
    });

    if (!application || !application.user.candidateProfile) {
      return NextResponse.json({ error: 'Thiếu dữ liệu hồ sơ để phân tích' }, { status: 400 });
    }

    // Ghép dữ liệu để đưa cho AI đọc
    const jobData = `
      Vị trí: ${application.job.title}
      Mô tả: ${application.job.description}
      Yêu cầu: ${application.job.requirements || 'Không có'}
    `;

    const candidateData = `
      Kỹ năng: ${application.user.candidateProfile.skills || 'Không có'}
      Kinh nghiệm: ${application.user.candidateProfile.experience || 'Không có'}
      Học vấn: ${application.user.candidateProfile.education || 'Không có'}
      Giới thiệu: ${application.user.candidateProfile.bio || 'Không có'}
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Viết Prompt (Câu lệnh) ép AI đóng vai chuyên gia nhân sự và trả về JSON chuẩn
    const prompt = `
      Bạn là một chuyên gia tuyển dụng (HR). Hãy phân tích sự phù hợp giữa Yêu cầu công việc và Hồ sơ ứng viên dưới đây.
      
      YÊU CẦU CÔNG VIỆC:
      ${jobData}

      HỒ SƠ ỨNG VIÊN:
      ${candidateData}

      Nhiệm vụ: Trả về kết quả phân tích DƯỚI DẠNG CHUỖI JSON HỢP LỆ (Không Markdown, không định dạng gì thêm).
      Cấu trúc JSON bắt buộc phải như sau:
      {
        "score": <Điểm số phù hợp từ 0 đến 100>,
        "pros": ["Điểm mạnh 1", "Điểm mạnh 2"],
        "cons": ["Điểm yếu 1", "Điểm yếu 2"],
        "summary": "Một câu nhận xét tổng quan ngắn gọn (tiếng Việt)."
      }
    `;

    // Gọi AI
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Xóa markdown (nếu AI lỡ trả về ```json...```) để parse an toàn
    const cleanJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiAnalysis = JSON.parse(cleanJsonString);

    return NextResponse.json({ success: true, data: aiAnalysis });
  } catch (error) {
    console.error('Lỗi phân tích AI:', error);
    return NextResponse.json({ error: 'Lỗi khi gọi AI phân tích' }, { status: 500 });
  }
}