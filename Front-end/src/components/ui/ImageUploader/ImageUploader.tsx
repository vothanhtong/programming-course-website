import React, { useRef, useState } from 'react';
import uploadApi from '../../../api/uploadApi';

interface ImageUploaderProps {
  onUpload: (url: string) => void;
  currentImage?: string;
  type?: 'student-avatar' | 'admin-avatar' | 'course-image';
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  currentImage,
  type = 'course-image',
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    if (file.size > 5 * 1024 * 1024) {
      setError('Tệp quá lớn. Tối đa 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      // Show preview
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      // Upload
      let response;
      if (type === 'student-avatar') {
        response = await uploadApi.uploadStudentAvatar(file);
      } else if (type === 'admin-avatar') {
        response = await uploadApi.uploadAdminAvatar(file);
      } else {
        response = await uploadApi.uploadCourseImage(file);
      }

      onUpload(response.url);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Upload thất bại. Vui lòng thử lại.');
      setPreview(null);
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-3">
        {/* Preview */}
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-all"
        >
          {loading ? 'Đang tải...' : preview ? 'Thay đổi ảnh' : 'Chọn ảnh'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 py-2 rounded-lg text-sm bg-red-500/20 border border-red-500 text-red-400">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
