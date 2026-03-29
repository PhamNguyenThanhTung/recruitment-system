import * as React from 'react';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

type Props = {
  hrName?: string | null;
  jobTitle: string;
  candidateName?: string | null;
  applicationUrl: string;
};

export function NewApplicationNotificationEmail({
  hrName,
  jobTitle,
  candidateName,
  applicationUrl,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Bạn có ứng viên mới cho vị trí {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Có ứng viên mới</Heading>
          <Text style={text}>Chào {hrName || 'anh/chị'},</Text>
          <Text style={text}>
            Bạn có ứng viên mới cho vị trí <strong>{jobTitle}</strong>.
          </Text>
          {candidateName ? (
            <Text style={text}>
              Ứng viên: <strong>{candidateName}</strong>.
            </Text>
          ) : null}

          <Section style={buttonWrap}>
            <Button href={applicationUrl} style={button}>
              Xem hồ sơ ứng viên
            </Button>
          </Section>

          <Text style={footer}>
            Nếu nút không hoạt động, mở link sau: {applicationUrl}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '20px auto',
  padding: '24px',
  borderRadius: '8px',
  maxWidth: '560px',
};

const h1 = {
  fontSize: '20px',
  margin: '0 0 16px',
  color: '#111827',
};

const text = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#374151',
};

const buttonWrap = {
  margin: '24px 0',
};

const button = {
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderRadius: '6px',
  padding: '12px 18px',
  textDecoration: 'none',
  fontSize: '14px',
};

const footer = {
  fontSize: '12px',
  color: '#6b7280',
};
