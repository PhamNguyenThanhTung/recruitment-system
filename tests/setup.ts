import { vi } from 'vitest';

const auth = vi.fn();

const db = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
  },
  job: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
  application: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    deleteMany: vi.fn(),
    count: vi.fn(),
  },
  savedJob: {
    create: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
  companyProfile: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  candidateProfile: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  report: {
    create: vi.fn(),
    count: vi.fn(),
    deleteMany: vi.fn(),
  },
  interview: {
    upsert: vi.fn(),
  },
};

const uploadToCloudinary = vi.fn(async () => 'https://cloudinary.test/mock');
const sendNewApplicationNotificationEmail = vi.fn(async () => true);
const sendApplicationSuccessEmail = vi.fn(async () => true);
const sendInterviewEmail = vi.fn(async () => true);

vi.mock('@/lib/auth', () => ({
  auth,
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  },
}));
vi.mock('@/lib/db', () => ({ db }));
vi.mock('@/lib/cloudinary', () => ({ uploadToCloudinary }));
vi.mock('@/lib/email', () => ({
  sendNewApplicationNotificationEmail,
  sendApplicationSuccessEmail,
  sendInterviewEmail,
}));
vi.mock('@/lib/validations', () => ({
  fileValidation: vi.fn(),
  jobSchema: { parse: (value: any) => value },
  updateCandidateProfileSchema: { parse: (value: any) => value },
}));

export { auth, db, uploadToCloudinary, sendNewApplicationNotificationEmail, sendApplicationSuccessEmail, sendInterviewEmail };
