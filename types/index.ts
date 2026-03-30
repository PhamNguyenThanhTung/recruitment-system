export type UserRole = "HR";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string;
  createdAt: Date;
}

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements?: string;
  salary?: string;
  location: string;
  deadline?: Date;
  status: JobStatus;
  userId: string;
  createdAt: Date;
}

export type ApplicationStatus = "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED" | "INTERVIEW";

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  job: Job;
  status: ApplicationStatus;
  resume?: string;
  coverLetter?: string;
  appliedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
