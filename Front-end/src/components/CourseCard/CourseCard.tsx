import React, { useState } from 'react';
import type { Course } from '../../types';
import EnrollModal from '../EnrollModal/EnrollModal';

interface Props { course: Course; }

const levelMap: Record<string, string>  = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };
const levelColor: Record<string, { bg: string; text: string; border: string }> = {
  beginner:     { bg: 'rgba(16,185,129,0.12)',  text: '#34d399', border: 'rgba(16,185,129,0.25)' },
  intermediate: { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  advanced:     { bg: 'rgba(239,68,68,0.12)',   text: '#f87171', border: 'rgba(239,68,68,0.25)' },
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className="text-sm" style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#1e293b' }}>★</span>
    ))}
  </div>
);

const CourseCard: React.FC<Props> = ({ course }) => {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [hovered, setHovered]       = useState(false);
  const price    = course.salePrice != null ? course.salePrice : course.price;
  const category = typeof course.category === 'object' ? course.category : null;
  const lc       = levelColor[course.level] || levelColor.beginner;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          background: 'rgba(15,23,42,0.7)',
          border: hovered ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(59,130,246,0.12)',
          boxShadow: hovered ? '0 8px 32px rgba(59,130,246,0.15), 0 0 0 1px rgba(59,130,246,0.1)' : '0 4px 16px rgba(0,0,0,0.3)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}>

        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a5f)' }}>
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-extrabold" style={{ color: 'rgba(59,130,246,0.2)' }}>{'</>'}</span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.6) 0%, transparent 60%)' }} />

          {course.isFeatured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'rgba(201,168,76,0.9)', color: '#0f172a' }}>⭐ Nổi bật</div>
          )}
          {course.isFree && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.9)', color: '#fff' }}>Miễn phí</div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: lc.bg, color: lc.text, border: `1px solid ${lc.border}` }}>
              {levelMap[course.level]}
            </span>
            {category && (
              <span className="text-xs font-medium" style={{ color: '#475569' }}>{category.name}</span>
            )}
          </div>

          <h3 className="text-base font-bold mb-2 leading-snug line-clamp-2" style={{ color: '#f1f5f9' }}>
            {course.title}
          </h3>
          <p className="text-sm leading-relaxed mb-4 line-clamp-2 flex-1" style={{ color: '#64748b' }}>
            {course.shortDescription}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: '#475569' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              {course.instructor?.avatar
                ? <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
                : course.instructor?.name?.[0] || 'G'}
            </div>
            <span>{course.instructor?.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm" style={{ color: '#475569' }}>
            <div className="flex items-center gap-1">
              <StarRating rating={course.rating} />
              <span style={{ color: '#334155' }}>({course.ratingCount})</span>
            </div>
            <span>📚 {course.totalLessons} bài</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-3"
          style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}>
          <div className="flex flex-col">
            {course.isFree ? (
              <span className="text-xl font-extrabold" style={{ color: '#34d399' }}>Miễn phí</span>
            ) : (
              <>
                <span className="text-xl font-extrabold" style={{ color: '#60a5fa' }}>
                  {price.toLocaleString('vi-VN')}đ
                </span>
                {course.salePrice != null && (
                  <span className="text-xs line-through" style={{ color: '#334155' }}>
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </>
            )}
          </div>
          <button className="btn btn-primary text-sm px-4 py-2" onClick={() => setEnrollOpen(true)}>
            Đăng ký ngay
          </button>
        </div>
      </div>

      <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} course={course} />
    </>
  );
};

export default CourseCard;
