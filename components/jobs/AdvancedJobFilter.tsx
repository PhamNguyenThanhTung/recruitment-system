'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useTransition, useRef } from 'react';

// Enum JobType cho Checkbox
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'];

export default function AdvancedJobFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();

  // Khởi tạo state từ URL hiện tại
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '0');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('jobType')?.split(',') || []
  );

  const hasActiveFilters = keyword || location || minSalary !== '0' || selectedTypes.length > 0;

  // 🔥 TUYỆT CHIÊU 1: Dùng useRef để chặn useEffect tự động đẩy URL ở lần load trang đầu tiên
  const initialRender = useRef(true);

  // Áp dụng Debounce 500ms
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }

    const timer = setTimeout(() => {
      // Khởi tạo params trực tiếp trong này để lấy bản mới nhất
      const params = new URLSearchParams(searchParams.toString());

      if (keyword) params.set('q', keyword); else params.delete('q');
      if (location) params.set('location', location); else params.delete('location');
      if (minSalary !== '0') params.set('minSalary', minSalary); else params.delete('minSalary');
      if (selectedTypes.length > 0) params.set('jobType', selectedTypes.join(',')); else params.delete('jobType');

      // Khi filter thay đổi, luôn reset về trang 1
      params.set('page', '1');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 500);

    return () => clearTimeout(timer);
    
    // 🔥 TUYỆT CHIÊU 2: TUYỆT ĐỐI KHÔNG ĐỂ searchParams VÀO ĐÂY!

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, location, minSalary, selectedTypes, pathname, router]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleClearFilters = () => {
    setKeyword('');
    setLocation('');
    setMinSalary('0');
    setSelectedTypes([]);
  };

  return (
    <div className="relative flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      
      {/* LỚP PHỦ LOADING BÁN TRONG SUỐT */}
      {isPending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined animate-spin text-3xl text-blue-600">
              progress_activity
            </span>
            <span className="text-sm font-medium text-blue-600">Đang cập nhật...</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Bộ lọc tìm kiếm</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-700 hover:underline"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Keyword */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Từ khóa</label>
        <input
          type="text"
          placeholder="Tên công việc, công ty..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Địa điểm</label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Tất cả địa điểm</option>
          <option value="Hà Nội">Hà Nội</option>
          <option value="Hồ Chí Minh">Hồ Chí Minh</option>
          <option value="Đà Nẵng">Đà Nẵng</option>
          <option value="Remote">Remote</option>
        </select>
      </div>

      {/* Job Type (Checkbox) */}
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-gray-700">Loại công việc</label>
        <div className="flex flex-col gap-2">
          {JOB_TYPES.map((type) => (
            <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => handleTypeToggle(type)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {type.replace('_', ' ')}
            </label>
          ))}
        </div>
      </div>

      {/* Salary Slider */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 flex justify-between">
          <span>Lương tối thiểu</span>
          <span className="font-bold text-blue-600">
            {minSalary === '0' ? 'Tất cả' : `${(Number(minSalary) / 1000000).toString()} Triệu`}
          </span>
        </label>
        <input
          type="range"
          min="0"
          max="50000000"
          step="5000000"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
        />
      </div>
    </div>
  );
}