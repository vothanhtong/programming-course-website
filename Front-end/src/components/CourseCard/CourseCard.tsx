import React, { useState, memo } from 'react';
import type { Course } from '../../types';
import EnrollModal from '../EnrollModal/EnrollModal';
import { useTranslation } from 'react-i18next';
import { LEVEL_MAP, LEVEL_COLORS } from '../../utils/constants';

interface Props { course: Course; }

// Memoized star rating — only re-renders when rating value changes
const StarRating: React.FC<{ rating: number }> = memo(({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} className="text-sm" style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#1e293b' }}>★</span>
    ))}
  </div>
));
StarRating.displayName = 'StarRating';

// Memoized card — only re-renders when the course object reference changes.
// Since courses come from a stable array, this prevents re-renders during
// CoursesSection filter/search state updates.
const CourseCard: React.FC<Props> = memo(({ course }) => {
  const { t } = useTranslation();
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [hovered, setHovered]       = useState(false);

  const price    = course.salePrice != null ? course.salePrice : course.price;
  const category = typeof course.category === 'object' ? course.category : null;
  const lc       = LEVEL_COLORS.dark[course.level] ?? LEVEL_COLORS.dark.beginner;

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden flex flex-col transition-all duration-300 bg-white border border-slate-200 shadow-sm dark:bg-[rgba(15,23,42,0.7)] dark:border-[rgba(59,130,246,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
        style={{
          borderColor: hovered ? 'rgba(59,130,246,0.4)' : undefined,
          boxShadow:   hovered ? '0 8px 32px rgba(59,130,246,0.15)' : undefined,
          transform:   hovered ? 'translateY(-4px)' : 'translateY(0)',
          backdropFilter: 'blur(8px)',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Thumbnail */}
        <div className="relative h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-extrabold" style={{ color: 'rgba(59,130,246,0.2)' }}>{'</>'}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent dark:from-[rgba(15,23,42,0.6)]" />
          {course.isFeatured && (
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-[rgba(201,168,76,0.9)] text-slate-900">
              ⭐ Nổi bật
            </div>
          )}
          {course.isFree && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500 text-white">
              {t('courses.free')}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
              style={{ background: lc.bg, color: lc.text, border: `1px solid ${lc.border}` }}>
              {LEVEL_MAP[course.level]}
            </span>
            {category && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{category.name}</span>
            )}
          </div>

          <h3 className="text-base font-bold mb-2 leading-snug line-clamp-2 text-slate-900 dark:text-slate-100">
            {course.title}
          </h3>
          <p className="text-sm leading-relaxed mb-4 line-clamp-2 flex-1 text-slate-600 dark:text-slate-400">
            {course.shortDescription}
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 mb-3 text-sm text-slate-500 dark:text-slate-400">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>
              {course.instructor?.avatar
                ? <img src={course.instructor.avatar} alt={course.instructor.name} className="w-full h-full object-cover" />
                : course.instructor?.name?.[0] ?? 'G'}
            </div>
            <span>{course.instructor?.name}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <StarRating rating={course.rating} />
              <span className="text-slate-600 dark:text-slate-500">({course.ratingCount})</span>
            </div>
            <span>📚 {course.totalLessons} {t('courses.lessons')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-[rgba(59,130,246,0.1)]">
          <div className="flex flex-col">
            {course.isFree ? (
              <span className="text-xl font-extrabold text-emerald-500">{t('courses.free')}</span>
            ) : (
              <>
                <span className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {price.toLocaleString('vi-VN')}đ
                </span>
                {course.salePrice != null && (
                  <span className="text-xs line-through text-slate-500 dark:text-slate-600">
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
});
CourseCard.displayName = 'CourseCard';

export default CourseCard;
