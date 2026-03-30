import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import Navbar from "@/components/layout/Navbar"; 
import "./globals.css";
// 🔥 1. IMPORT SUSPENSE TỪ REACT
import { Suspense } from "react";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-headline", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RecruitSync | Modern Recruitment Solutions",
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
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <link 
          rel="stylesheet" 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,0..1,0&display=swap" 
        />
      </head>

      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ToastProvider />
          
          {/* 🔥 2. BỌC NAVBAR VÀO SUSPENSE 
              Vì Navbar thường xài useSearchParams để check URL active hoặc Search */}
          <Suspense fallback={<div className="h-16 w-full bg-surface" />}>
            <Navbar />
          </Suspense>

          {/* 🔥 3. BỌC CẢ MAIN CHILDREN VÀO SUSPENSE 
              Để "cứu" trang 404 và các trang con khác khi build tĩnh */}
          <main className="flex-1">
            <Suspense fallback={<div className="flex items-center justify-center p-20">Đang tải nội dung...</div>}>
               {children}
            </Suspense>
          </main>
          
        </SessionProvider>
      </body>
    </html>
  );
}