import type { Metadata } from "next";
import { Geist, Geist_Mono, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
// 🔥 IMPORT NAVBAR VÀO ĐÂY
import Navbar from "@/components/layout/Navbar"; 
import "./globals.css";

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
          
          {/* 🔥 GẮN NAVBAR VÀO ĐÂY */}
          <Navbar />

          {/* Bao bọc content bằng main flex-1 để full chiều cao */}
          <main className="flex-1">
             {children}
          </main>
          
        </SessionProvider>
      </body>
    </html>
  );
}