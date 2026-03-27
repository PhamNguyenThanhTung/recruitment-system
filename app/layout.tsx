import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Recruitment System",
  description: "Multi-tenant recruitment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950">
        {/* ===== Session Provider: Cung cấp NextAuth session context ===== */}
        <SessionProvider>
          {/* ===== Toast Provider: Hiển thị thông báo trên toàn ứng dụng ===== */}
          <ToastProvider />
          
          {/* ===== Main Content: Children layouts sẽ chứa Navbar riêng của họ ===== */}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
