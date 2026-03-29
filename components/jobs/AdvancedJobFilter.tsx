'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

// Enum JobType cho Checkbox (Khớp với Prisma Schema của bạn)
const JOB_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'];

export default function AdvancedJobFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Khởi tạo state từ URL hiện tại
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '0');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('jobType')?.split(',') || []
  );

  // Helper function để gộp query params mới vào URL cũ
  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      
      // Khi filter thay đổi, luôn reset về trang 1
      params.set('page', '1'); 
      return params.toString();
    },
    [searchParams]
  );

  // Áp dụng Debounce 500ms trước khi push lên URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const queryString = createQueryString({
        q: keyword,
        location: location,
        minSalary: minSalary === '0' ? null : minSalary,
        jobType: selectedTypes.length > 0 ? selectedTypes.join(',') : null,
      });
      router.push(`${pathname}?${queryString}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, location, minSalary, selectedTypes, pathname, router, createQueryString]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Bộ lọc tìm kiếm</h3>

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
            <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
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
        <label className="text-sm font-medium text-gray-700">
          Mức lương tối thiểu: <span className="font-bold text-blue-600">{Number(minSalary).toLocaleString('vi-VN')} VNĐ</span>
        </label>
        <input
          type="range"
          min="0"
          max="50000000"
          step="5000000"
          value={minSalary}
          onChange={(e) => setMinSalary(e.target.value)}
          className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
        />
      </div>
    </div>
  );
}