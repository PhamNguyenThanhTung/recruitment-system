"use client";

/**
 * Public Layout - Đã dọn dẹp sạch sẽ Navbar cũ
 * (Navbar chính giờ đã được quản lý tập trung ở RootLayout)
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-container min-h-screen flex flex-col">
      {/* Không cần pt-20 nữa vì Navbar ở RootLayout là dạng 'sticky' */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}