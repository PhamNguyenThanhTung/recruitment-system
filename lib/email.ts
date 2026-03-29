import { Resend } from 'resend';
import { NewApplicationNotificationEmail } from '@/emails/NewApplicationNotificationEmail';

type SendNewApplicationEmailParams = {
  to: string;
  hrName?: string | null;
  jobTitle: string;
  candidateName?: string | null;
  applicationUrl: string;
};

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
}
