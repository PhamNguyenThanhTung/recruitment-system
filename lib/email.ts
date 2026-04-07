import { Resend } from 'resend';
import { NewApplicationNotificationEmail } from '@/emails/NewApplicationNotificationEmail';
import StatusUpdateEmail from '@/emails/status-update';
import { ApplicationStatus } from '@prisma/client';

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
}

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// ==========================================
// HÀM 1: GỬI MAIL KHI CÓ ỨNG VIÊN MỚI
// ==========================================
export async function sendNewApplicationNotificationEmail(
  params: SendNewApplicationEmailParams
) {
  if (!resend) {
    console.warn('❌ LỖI: Không tìm thấy RESEND_API_KEY trong file .env');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Recruitment System <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Bạn có ứng viên mới cho vị trí ${params.jobTitle}`,
      react: NewApplicationNotificationEmail({
        hrName: params.hrName,
        jobTitle: params.jobTitle,
        candidateName: params.candidateName,
        applicationUrl: params.applicationUrl,
      }),
    });

    if (error) {
      console.error('❌ LỖI TỪ API RESEND (Ứng viên mới):', error);
      return;
    }

    console.log('✅ GỬI EMAIL (Ứng viên mới) THÀNH CÔNG! ID:', data?.id);
  } catch (error) {
    console.error('❌ LỖI MẠNG/CODE KHI GỬI EMAIL (Ứng viên mới):', error);
  }
}

// ==========================================
// HÀM 2: GỬI MAIL KHI CẬP NHẬT TRẠNG THÁI
// ==========================================
export async function sendStatusUpdateEmail(params: SendStatusUpdateEmailParams) {
  if (!resend) {
    console.warn('❌ LỖI: Không tìm thấy RESEND_API_KEY trong file .env');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Recruitment System <onboarding@resend.dev>';

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: params.to,
      subject: `Cập nhật trạng thái ứng tuyển cho vị trí ${params.jobTitle}`,
      react: StatusUpdateEmail({
        candidateName: params.candidateName,
        jobTitle: params.jobTitle,
        newStatus: params.newStatus,
        companyName: params.companyName,
      }),
    });

    if (error) {
      console.error('❌ LỖI TỪ API RESEND (Cập nhật trạng thái):', error);
      return;
    }

    console.log('✅ GỬI EMAIL (Cập nhật trạng thái) THÀNH CÔNG! ID:', data?.id);
  } catch (error) {
    console.error('❌ LỖI MẠNG/CODE KHI GỬI EMAIL (Cập nhật trạng thái):', error);
  }
}