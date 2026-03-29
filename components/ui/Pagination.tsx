'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export default function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null; // Không hiện Pagination nếu chỉ có 1 trang

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handlePageChange = (page: number) => {
    router.push(createPageURL(page), { scroll: true });
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      {/* Nút Previous */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-sm">chevron_left</span>
        Trước
      </button>

      {/* Render số trang */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
            currentPage === page
              ? 'bg-blue-600 text-white shadow-sm'
              : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Nút Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 min-w-[40px] items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
      >
        Sau
        <span className="material-symbols-outlined text-sm">chevron_right</span>
      </button>
    </div>
  );
}