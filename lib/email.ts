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

export async function sendNewApplicationNotificationEmail(
  params: SendNewApplicationEmailParams
) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Skip sending notification email.');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Recruitment System <onboarding@resend.dev>';

  try {
    await resend.emails.send({
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
  } catch (error) {
    console.error('❌ Error sending new application notification email:', error);
  }
}

export async function sendStatusUpdateEmail(params: SendStatusUpdateEmailParams) {
  if (!resend) {
    console.warn('RESEND_API_KEY is missing. Skip sending status update email.');
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || 'Recruitment System <onboarding@resend.dev>';

  try {
    await resend.emails.send({
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
} catch (error) {
    console.error('❌ Error sending status update email:', error);
  }
}
