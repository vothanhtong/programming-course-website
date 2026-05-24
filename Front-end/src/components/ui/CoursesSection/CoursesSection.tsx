import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CourseCard from '../CourseCard/CourseCard';
import CourseCardSkeleton from '../../common/Skeleton/CourseCardSkeleton';
import courseApi from '../../../api/courseApi';
import { debounce } from '../../../utils/helpers';
import type { Course, Category } from '../../../types';

const PER_PAGE = 9;

const CoursesSection: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses]               = useState<Course[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]                 = useState('');
  const [loading, setLoading]               = useState(true);
  const [page, setPage]                     = useState(1);
  const [total, setTotal]                   = useState(0);

  useEffect(() => {
    courseApi.getCategories()
      .then(r => setCategories(r.categories ?? []))
      .catch(() => {});
  }, []);

  const fetchCourses = useCallback(async (p: number, cat: string, q: string, isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, perPage: PER_PAGE };
      if (cat !== 'all') params.category = cat;
      if (q.trim())      params.search   = q.trim();
      const res = await courseApi.getCourses(params);
      setCourses(res.courses ?? []);
      setTotal(res.total ?? 0);
      setPage(p);
    } catch {
      setCourses([]);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  // Initial load + category change
  useEffect(() => {
    fetchCourses(1, activeCategory, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  // Auto refresh every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCourses(page, activeCategory, search, true);
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchCourses, page, activeCategory, search]);

  // Debounced search — created once, stable reference
  const debouncedSearch = useMemo(
    () => debounce((q: string, cat: string) => fetchCourses(1, cat, q), 400),
    [fetchCourses]
  );

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    debouncedSearch(val, activeCategory);
  }, [debouncedSearch, activeCategory]);

  const handleCategoryChange = useCallback((catId: string) => {
    setActiveCategory(catId);
    // fetchCourses triggered by the useEffect above
  }, []);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <section className="section bg-slate-100 dark:bg-transparent relative" id="courses">
      <div className="absolute inset-0 dark:bg-[linear-gradient(180deg,#0a0f1e_0%,#0f172a_100%)] pointer-events-none -z-10" />
      <div className="container relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="tag tag-blue mb-4">📚 {t('courses.title')}</span>
          <h2 className="section-title text-slate-900 dark:text-white">{t('courses.title')}</h2>
          <p className="section-subtitle text-slate-600 dark:text-slate-400">
            Hơn 50 khóa học được thiết kế bài bản, cập nhật liên tục theo xu hướng công nghệ mới nhất
          </p>
        </div>

        {/* Search */}
        <div className="flex justify-center mb-6">
          <div className="relative w-full max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base" style={{ color: '#475569' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm khóa học..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-all bg-white border border-slate-300 text-slate-900 dark:bg-[rgba(15,23,42,0.6)] dark:border-[rgba(59,130,246,0.2)] dark:text-slate-200"
            />
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          {[{ _id: 'all', name: 'Tất cả' } as Category, ...categories].map(cat => {
            const isActive = activeCategory === cat._id;
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat._id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border ${
                  isActive 
                    ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-[rgba(59,130,246,0.2)] dark:border-[rgba(59,130,246,0.6)] dark:text-blue-400 dark:shadow-[0_0_12px_rgba(59,130,246,0.2)]' 
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-[rgba(15,23,42,0.6)] dark:border-[rgba(59,130,246,0.15)] dark:text-slate-400'
                }`}
              >
                {(cat as any).icon && <span className="mr-1">{(cat as any).icon}</span>}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, i) => <CourseCardSkeleton key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-sm" style={{ color: '#475569' }}>Chưa có khóa học nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map(course => <CourseCard key={course._id} course={course} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => fetchCourses(i + 1, activeCategory, search)}
                className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer border ${
                  page === i + 1
                    ? 'bg-blue-100 border-blue-400 text-blue-600 dark:bg-[rgba(59,130,246,0.25)] dark:border-[rgba(59,130,246,0.6)] dark:text-blue-400'
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-[rgba(15,23,42,0.6)] dark:border-[rgba(59,130,246,0.15)] dark:text-slate-400'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
