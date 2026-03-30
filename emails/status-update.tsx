import { Html, Head, Body, Container, Text, Section, Heading, Hr } from '@react-email/components';
import * as React from 'react';

interface StatusUpdateEmailProps {
  candidateName: string;
  jobTitle: string;
  newStatus: 'PENDING' | 'REVIEWING' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED';
  companyName: string;
}

// Helper dịch trạng thái sang tiếng Việt và chọn màu
const getStatusDetails = (status: StatusUpdateEmailProps['newStatus']) => {
  switch (status) {
    case 'REVIEWING': return { text: 'Đang xem xét', color: '#f59e0b' }; // Cam
    case 'INTERVIEWING': return { text: 'Được mời phỏng vấn', color: '#3b82f6' }; // Xanh dương
    case 'OFFERED': return { text: 'Đã nhận Offer', color: '#10b981' }; // Xanh lá
    case 'REJECTED': return { text: 'Không phù hợp', color: '#ef4444' }; // Đỏ
    default: return { text: 'Đã tiếp nhận', color: '#6b7280' }; // Xám
  }
};

export default function StatusUpdateEmail({
  candidateName = 'Ứng viên',
  jobTitle = 'Vị trí công việc',
  newStatus = 'PENDING',
  companyName = 'Công ty',
}: StatusUpdateEmailProps) {
  const statusInfo = getStatusDetails(newStatus);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Cập nhật trạng thái ứng tuyển</Heading>
          <Text style={text}>Chào {candidateName},</Text>
          <Text style={text}>
            Hồ sơ ứng tuyển của bạn cho vị trí <strong>{jobTitle}</strong> tại <strong>{companyName}</strong> vừa được nhân sự cập nhật trạng thái mới:
          </Text>
          
          <Section style={statusBox}>
            <Text style={{ ...statusText, color: statusInfo.color }}>
              Trạng thái hiện tại: <strong>{statusInfo.text}</strong>
            </Text>
          </Section>

          <Text style={text}>
            {newStatus === 'INTERVIEWING' && 'Chúc mừng bạn! Bộ phận nhân sự sẽ sớm liên hệ với bạn qua email hoặc số điện thoại để sắp xếp lịch phỏng vấn chi tiết.'}
            {newStatus === 'REJECTED' && 'Cảm ơn bạn đã quan tâm và dành thời gian ứng tuyển. Rất tiếc hiện tại chúng tôi chưa có vị trí phù hợp với định hướng của bạn. Chúc bạn thành công trên con đường sự nghiệp!'}
            {newStatus === 'OFFERED' && 'Chúc mừng bạn đã xuất sắc vượt qua các vòng tuyển dụng! Hãy kiểm tra kỹ hòm thư để nhận thông tin chi tiết về Offer nhé.'}
            {(newStatus === 'REVIEWING' || newStatus === 'PENDING') && 'Vui lòng kiên nhẫn chờ thêm. Chúng tôi đang xem xét kỹ lưỡng hồ sơ của bạn.'}
          </Text>

          <Hr style={hr} />
          <Text style={footer}>
            Hệ thống tuyển dụng tự động • Không trả lời trực tiếp email này.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// --- Styles ---
const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif' };
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '20px 0 48px', marginBottom: '64px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', textAlign: 'center' as const, margin: '30px 0' };
const text = { color: '#525f7f', fontSize: '16px', lineHeight: '24px', padding: '0 40px', textAlign: 'left' as const };
const statusBox = { backgroundColor: '#f3f4f6', padding: '16px', borderRadius: '8px', margin: '20px 40px', textAlign: 'center' as const };
const statusText = { fontSize: '18px', margin: '0' };
const hr = { borderColor: '#e6ebf1', margin: '20px 0' };
const footer = { color: '#8898aa', fontSize: '12px', textAlign: 'center' as const };
