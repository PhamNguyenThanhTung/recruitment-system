import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendInterviewEmail } from "@/lib/email"; // ⚠️ Sếp check lại đường dẫn là /mail hay /email nhé

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const body = await req.json();
    const { applicationId, interviewerEmail, time, location, round } = body;

    // 1. Tìm thông tin hồ sơ
    const application = await db.application.findUnique({
      where: { id: applicationId },
      include: { user: true, job: true }
    });

    if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 });

    // 2. Logic thông minh: Nếu email nhập vào trùng với một User trong hệ thống thì link ID, 
    // nếu không thì cứ để ID trống.
    const existingUser = await db.user.findUnique({ where: { email: interviewerEmail } });

    const interview = await db.interview.upsert({
      where: { applicationId },
      update: {
        interviewerEmail,
        interviewerId: existingUser?.id || null, // Link nếu có tài khoản
        time: new Date(time),
        location,
        round
      },
      create: {
        applicationId,
        interviewerEmail,
        interviewerId: existingUser?.id || null,
        time: new Date(time),
        location,
        round
      }
    });

    // 3. Cập nhật trạng thái Application
    await db.application.update({
      where: { id: applicationId },
      data: { status: "INTERVIEWING" }
    });

    // 4. Bắn Email (Dùng interviewerEmail trực tiếp)
    await sendInterviewEmail({
      candidateEmail: application.user.email,
      candidateName: application.user.name,
      interviewerEmail: interviewerEmail, // Dùng email vừa nhập
      interviewerName: existingUser?.name || "Interviewer", 
      jobTitle: application.job.title,
      time: new Date(time),
      location,
      round
    });

    return NextResponse.json(interview);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}