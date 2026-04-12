import nodemailer from 'nodemailer';
import { ApplicationStatus } from '@prisma/client';

// Giữ nguyên Type cũ để không lỗi code ở các file khác
type SendNewApplicationEmailParams = {
  to: string;
  hrName?: string | null;
  jobTitle: string;
  candidateName?: string | null;
  applicationUrl: string;
};

type SendStatusUpdateEmailParams = {
  to: string;
  candidateName: string;
  jobTitle: string;
  newStatus: ApplicationStatus;
  companyName: string;
};

type SendInterviewInviteParams = {
  candidateEmail: string;
  candidateName: string;
  interviewerEmail: string;
  interviewerName: string;
  jobTitle: string;
  time: Date;
  location: string;
  round: string;
};

// CẤU HÌNH NODEMAILER
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const fromEmail = `"Shisha HR" <${process.env.EMAIL_USER}>`;

// ==========================================
// HÀM 1: GỬI MAIL KHI CÓ ỨNG VIÊN MỚI
// ==========================================
export async function sendNewApplicationNotificationEmail(params: SendNewApplicationEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: params.to,
      subject: `[Shisha] Có ứng viên mới cho vị trí: ${params.jobTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>Chào ${params.hrName || 'bạn'},</h2>
          <p>Hệ thống vừa ghi nhận một hồ sơ ứng tuyển mới từ <strong>${params.candidateName || 'một ứng viên'}</strong> cho vị trí <strong>${params.jobTitle}</strong>.</p>
          <p>Vui lòng đăng nhập vào hệ thống để xem xét hồ sơ:</p>
          <a href="${params.applicationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Xem hồ sơ ngay</a>
        </div>
      `,
    });
    console.log('✅ Đã gửi mail (Ứng viên mới):', info.messageId);
  } catch (error) {
    console.error('❌ Lỗi gửi mail (Ứng viên mới):', error);
  }
}

// ==========================================
// HÀM 2: GỬI MAIL KHI CẬP NHẬT TRẠNG THÁI
// ==========================================
export async function sendStatusUpdateEmail(params: SendStatusUpdateEmailParams) {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: params.to,
      subject: `[Shisha] Cập nhật trạng thái hồ sơ: ${params.jobTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5;">
          <h2>Chào ${params.candidateName},</h2>
          <p>Hồ sơ ứng tuyển của bạn cho vị trí <strong>${params.jobTitle}</strong> tại công ty <strong>${params.companyName}</strong> vừa được cập nhật trạng thái mới:</p>
          <h3 style="color: #28a745;">Trạng thái hiện tại: ${params.newStatus}</h3>
          <p>Vui lòng đăng nhập vào hệ thống Shisha để biết thêm chi tiết.</p>
          <br/>
          <p>Chúc bạn thành công!</p>
        </div>
      `,
    });
    console.log('✅ Đã gửi mail (Cập nhật trạng thái):', info.messageId);
  } catch (error) {
    console.error('❌ Lỗi gửi mail (Cập nhật trạng thái):', error);
  }
}

// ==========================================
// HÀM 3: GỬI MAIL MỜI PHỎNG VẤN
// ==========================================
export async function sendInterviewEmail(params: SendInterviewInviteParams) {
  const formattedTime = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(params.time));

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: [params.candidateEmail, params.interviewerEmail], // Gửi cho ứng viên và người phỏng vấn
      subject: `[Lịch Phỏng Vấn] Vị trí ${params.jobTitle} - ${params.round}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Xin chào ${params.candidateName},</h2>
          <p>Chúc mừng bạn đã vượt qua vòng sơ loại hồ sơ. Chúng tôi xin trân trọng mời bạn tham gia buổi phỏng vấn cho vị trí <strong>${params.jobTitle}</strong>.</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #cce5ff;">
            <h3 style="margin-top: 0; color: #004085;">Thông tin buổi phỏng vấn:</h3>
            <ul style="list-style-type: none; padding-left: 0;">
              <li style="margin-bottom: 8px;"><strong>Vòng:</strong> ${params.round}</li>
              <li style="margin-bottom: 8px;"><strong>Thời gian:</strong> <span style="color: #d9534f; font-weight: bold;">${formattedTime}</span></li>
              <li style="margin-bottom: 8px;"><strong>Địa điểm / Link Online:</strong> <a href="${params.location}" target="_blank">${params.location}</a></li>
              <li style="margin-bottom: 8px;"><strong>Người phụ trách:</strong> ${params.interviewerName}</li>
            </ul>
          </div>

          <p>Vui lòng chuẩn bị sẵn sàng trước 10 phút. Nếu có bất kỳ thay đổi nào, vui lòng phản hồi trực tiếp qua email này.</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Bộ phận Tuyển dụng Shisha</strong></p>
        </div>
      `,
    });
    console.log('✅ Đã gửi mail (Mời phỏng vấn):', info.messageId);
  } catch (error) {
    console.error('❌ Lỗi gửi mail (Mời phỏng vấn):', error);
  }
}
// Thêm type này lên đầu file
type SendApplicationSuccessParams = {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
};

// ==========================================
// HÀM 4: GỬI MAIL CHO ỨNG VIÊN KHI NỘP CV THÀNH CÔNG
// ==========================================
export async function sendApplicationSuccessEmail(params: SendApplicationSuccessParams) {
  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: params.candidateEmail,
      subject: `[RecruitSync] Nộp đơn thành công vị trí: ${params.jobTitle}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>Chào ${params.candidateName},</h2>
          <p>Chúc mừng bạn! Hồ sơ ứng tuyển của bạn cho vị trí <strong>${params.jobTitle}</strong> tại <strong>${params.companyName}</strong> đã được gửi thành công.</p>
          
          <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #cce5ff;">
            <p style="margin: 0;">Nhà tuyển dụng sẽ sớm xem xét hồ sơ của bạn. Bạn có thể theo dõi tiến trình ứng tuyển trực tiếp tại Dashboard của hệ thống.</p>
          </div>

          <p>Chúc bạn may mắn và sớm nhận được phản hồi tốt!</p>
          <br/>
          <p>Trân trọng,</p>
          <p><strong>Hệ thống RecruitSync</strong></p>
        </div>
      `,
    });
    console.log('✅ Đã gửi mail (Báo ứng viên nộp CV thành công):', info.messageId);
  } catch (error) {
    console.error('❌ Lỗi gửi mail (Báo ứng viên nộp CV thành công):', error);
  }
}