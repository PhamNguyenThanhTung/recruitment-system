/**
 * Auth Layout - For login and register pages
 * 
 * Simple layout without Navbar or header
 * Just plain form pages
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-zinc-950 dark:to-zinc-900 p-4">
      {children}
    </div>
  );
}
