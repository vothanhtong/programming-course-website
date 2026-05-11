import React, { useRef, useState } from 'react';
import { message, Spin } from 'antd';
import { UploadOutlined, DeleteOutlined, PictureOutlined } from '@ant-design/icons';
import adminApi from '../../api/adminApi';

/**
 * ImageUploader — chọn file ảnh từ máy, upload lên server, trả về URL
 *
 * Props:
 *   value       : string  — URL hiện tại (controlled)
 *   onChange    : (url: string) => void — callback khi URL thay đổi
 *   shape       : 'square' | 'circle'  — hình dạng preview (default: square)
 *   size        : number               — kích thước preview px (default: 120)
 *   placeholder : string               — text gợi ý
 */
const ImageUploader = ({
  value = '',
  onChange,
  shape = 'square',
  size = 120,
  placeholder = 'Chọn ảnh',
}) => {
  const inputRef   = useRef(null);
  const [loading, setLoading] = useState(false);

  const isCircle = shape === 'circle';

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate phía client trước khi upload
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      message.error('Chỉ chấp nhận file ảnh: jpg, png, webp, gif');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      message.error('File quá lớn. Tối đa 5MB.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminApi.uploadImage(file);
      onChange?.(res.url);
      message.success('Tải ảnh lên thành công');
    } catch (err) {
      message.error(err?.message || 'Tải ảnh thất bại');
    } finally {
      setLoading(false);
      // Reset input để có thể chọn lại cùng file
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange?.('');
  };

  const containerStyle = {
    width:        size,
    height:       size,
    borderRadius: isCircle ? '50%' : 10,
    border:       '2px dashed rgba(59,130,246,0.35)',
    background:   'rgba(15,23,42,0.6)',
    display:      'flex',
    flexDirection:'column',
    alignItems:   'center',
    justifyContent:'center',
    cursor:       'pointer',
    overflow:     'hidden',
    position:     'relative',
    transition:   'border-color 0.2s, background 0.2s',
    flexShrink:   0,
  };

  const overlayStyle = {
    position:       'absolute',
    inset:          0,
    background:     'rgba(0,0,0,0.55)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            8,
    opacity:        0,
    transition:     'opacity 0.2s',
    borderRadius:   isCircle ? '50%' : 8,
  };

  return (
    <div style={{ display: 'inline-block' }}>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div
        style={containerStyle}
        onClick={() => !loading && inputRef.current?.click()}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.7)';
          e.currentTarget.style.background  = 'rgba(15,23,42,0.8)';
          const overlay = e.currentTarget.querySelector('.img-overlay');
          if (overlay && value) overlay.style.opacity = '1';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
          e.currentTarget.style.background  = 'rgba(15,23,42,0.6)';
          const overlay = e.currentTarget.querySelector('.img-overlay');
          if (overlay) overlay.style.opacity = '0';
        }}
      >
        {loading ? (
          <Spin size="small" />
        ) : value ? (
          <>
            <img
              src={value}
              alt="preview"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {/* Hover overlay */}
            <div className="img-overlay" style={overlayStyle}>
              <button
                type="button"
                title="Đổi ảnh"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 20 }}
              >
                <UploadOutlined />
              </button>
              <button
                type="button"
                title="Xóa ảnh"
                onClick={handleRemove}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontSize: 20 }}
              >
                <DeleteOutlined />
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', color: '#475569', padding: 8 }}>
            <PictureOutlined style={{ fontSize: size > 80 ? 28 : 20, marginBottom: 6, display: 'block' }} />
            {size > 60 && (
              <span style={{ fontSize: 11, lineHeight: 1.3 }}>{placeholder}</span>
            )}
          </div>
        )}
      </div>

      {/* URL input bên dưới — vẫn cho nhập tay nếu muốn */}
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder="Hoặc dán URL ảnh..."
        style={{
          marginTop:   6,
          width:       size,
          padding:     '5px 8px',
          borderRadius: 6,
          border:      '1px solid rgba(59,130,246,0.2)',
          background:  'rgba(30,41,59,0.8)',
          color:       '#94a3b8',
          fontSize:    11,
          outline:     'none',
          boxSizing:   'border-box',
        }}
      />
    </div>
  );
};

export default ImageUploader;
