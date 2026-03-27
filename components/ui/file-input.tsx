'use client';

import { useState, useRef, ReactNode } from 'react';
import { AlertCircle, Upload, X } from 'lucide-react';

interface FileInputProps {
  acceptedTypes?: string[];
  maxSize?: number; // in bytes (default: 4MB)
  onFileSelect: (file: File) => void;
  label?: string;
  helperText?: string;
  error?: string;
}

/**
 * Component FileInput: Input file upload với validation
 * 
 * Hỗ trợ:
 * - Xác thực loại file
 * - Xác thực kích thước file
 * - Hiển thị lỗi validation
 * - Preview tên file đã chọn
 */
export function FileInput({
  acceptedTypes = ['.pdf', '.docx', '.doc'],
  maxSize = 4 * 1024 * 1024, // 4MB mặc định
  onFileSelect,
  label = 'Chọn file CV',
  helperText = 'PDF hoặc DOCX, tối đa 4MB',
  error,
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setValidationError('');

    // Kiểm tra loại file
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      setValidationError(
        `Loại file không được phép. Chỉ hỗ trợ: ${acceptedTypes.join(', ')}`
      );
      return;
    }

    // Kiểm tra kích thước file
    if (file.size > maxSize) {
      setValidationError(
        `Kích thước file vượt quá ${Math.round(maxSize / 1024 / 1024)}MB`
      );
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setValidationError('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const finalError = error || validationError;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {!selectedFile ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            Kéo và thả file hoặc click để chọn
          </p>
          <p className="text-xs text-gray-500 mt-1">{helperText}</p>
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            accept={acceptedTypes.join(',')}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-gray-300 rounded-lg p-4 bg-blue-50 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <Upload className="w-5 h-5 text-blue-600 mr-3" />
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-gray-700 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveFile}
            className="ml-2 p-1 hover:bg-red-100 rounded text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {finalError && (
        <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
          <AlertCircle className="w-4 h-4" />
          <span>{finalError}</span>
        </div>
      )}
    </div>
  );
}

export default FileInput;
