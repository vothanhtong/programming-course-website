import React, { useEffect, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import CourseCardSkeleton from '../../components/Skeleton/CourseCardSkeleton';
import progressApi from '../../api/progressApi';
import { useAuth } from '../../context/AuthContext';
import { LEVEL_MAP, LEVEL_COLORS } from '../../utils/constants';

export interface CourseWithProgress {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  rating: number;
  ratingCount: number;
  level: string;
  progressPercentage: number;
  completedLessons: number;
  totalLessons: number;
  isCompleted: boolean;
}

type Filter = 'all' | 'in-progress' | 'completed';

// ── Extracted + memoized card — no longer re-created on every parent render ──
const EnrolledCourseCard: React.FC<{ course: CourseWithProgress; onNavigate: (slug: string) => void }> = memo(
  ({ course, onNavigate }) => (
    <div
      onClick={() => onNavigate(course.slug)}
      className="rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
      style={{
        background: 'rgba(15,23,42,0.7)',
        border: '1px solid rgba(59,130,246,0.12)',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.12)')}
    >
      {/* Thumbnail */}
      <div className="relative w-full h-44 overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
        <img
          src={course.thumbnail || 'https://via.placeholder.com/300x200?text=Course'}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {course.isCompleted && (
          <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ background: 'rgba(16,185,129,0.9)' }}>
            ✓ Hoàn thành
          </div>
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.5) 0%, transparent 60%)' }} />
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-sm font-bold mb-3 line-clamp-2 leading-snug" style={{ color: '#f1f5f9' }}>
          {course.title}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
            style={{
              background: LEVEL_COLORS.dark[course.level as keyof typeof LEVEL_COLORS.dark]?.bg ?? 'rgba(100,116,139,0.15)',
              color:      LEVEL_COLORS.dark[course.level as keyof typeof LEVEL_COLORS.dark]?.text ?? '#94a3b8',
              border:     `1px solid ${LEVEL_COLORS.dark[course.level as keyof typeof LEVEL_COLORS.dark]?.border ?? 'rgba(100,116,139,0.25)'}`,
            }}>
            {LEVEL_MAP[course.level] ?? 'Không xác định'}
          </span>
          <div className="flex items-center gap-1 text-xs" style={{ color: '#94a3b8' }}>
            <span className="text-yellow-400">★</span>
            {course.rating.toFixed(1)} ({course.ratingCount})
          </div>
        </div>

        {/* Progress */}
        <div className="mt-auto">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: '#64748b' }}>
              {course.completedLessons}/{course.totalLessons} bài học
            </span>
            <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>{course.progressPercentage}%</span>
          </div>
          <div className="w-full rounded-full h-1.5" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${course.progressPercentage}%`,
                background: course.isCompleted
                  ? 'linear-gradient(90deg,#34d399,#10b981)'
                  : 'linear-gradient(90deg,#3b82f6,#60a5fa)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
);
EnrolledCourseCard.displayName = 'EnrolledCourseCard';

// ── Filter button ──
const FilterBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className="px-5 py-2 rounded-lg text-sm font-semibold transition-all border"
    style={{
      background:   active ? 'rgba(59,130,246,0.2)' : 'rgba(15,23,42,0.6)',
      borderColor:  active ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.15)',
      color:        active ? '#60a5fa' : '#64748b',
      boxShadow:    active ? '0 0 12px rgba(59,130,246,0.15)' : 'none',
    }}
  >
    {children}
  </button>
);

const MyCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { student, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<CourseWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState<Filter>('all');

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/login', { state: { from: '/my-courses' } });
    }
  }, [authLoading, student, navigate]);

  useEffect(() => {
    if (!student) return; // chờ auth xong mới fetch
    let isMounted = true;
    const fetchCourses = async (isBackground = false) => {
      if (!isBackground) setLoading(true);
      try {
        const { courses: data } = await progressApi.getMyEnrolledCourses();
        if (isMounted) setCourses(data);
      } catch {
        if (isMounted) setError('Không thể tải khóa học. Vui lòng thử lại.');
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    };
    fetchCourses();
    
    const interval = setInterval(() => fetchCourses(true), 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [student]);

  const handleNavigate = useCallback((slug: string) => navigate(`/courses/${slug}`), [navigate]);

  const counts = {
    all:         courses.length,
    'in-progress': courses.filter(c => !c.isCompleted && c.progressPercentage > 0).length,
    completed:   courses.filter(c => c.isCompleted).length,
  };

  const filtered = courses.filter(c => {
    if (filter === 'completed')  return c.isCompleted;
    if (filter === 'in-progress') return !c.isCompleted && c.progressPercentage > 0;
    return true;
  });

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(135deg,#020817 0%,#0f172a 60%,#0d1526 100%)' }}>
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Khóa Học Của Tôi</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>Quản lý và tiếp tục học tập</p>
        </div>

        {/* Filter */}
        <div className="flex flex-wrap gap-3 mb-8">
          <FilterBtn active={filter === 'all'}         onClick={() => setFilter('all')}>Tất Cả ({counts.all})</FilterBtn>
          <FilterBtn active={filter === 'in-progress'} onClick={() => setFilter('in-progress')}>Đang Học ({counts['in-progress']})</FilterBtn>
          <FilterBtn active={filter === 'completed'}   onClick={() => setFilter('completed')}>Đã Hoàn Thành ({counts.completed})</FilterBtn>
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 mb-8 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map(c => <EnrolledCourseCard key={c._id} course={c} onNavigate={handleNavigate} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-white mb-2">Chưa có khóa học</h2>
            <p className="text-sm mb-6" style={{ color: '#64748b' }}>
              {filter === 'completed'
                ? 'Bạn chưa hoàn thành khóa học nào. Hãy tiếp tục học tập!'
                : 'Hãy bắt đầu hành trình học tập ngay hôm nay!'}
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary px-8">
              Khám Phá Khóa Học
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MyCoursesPage;
