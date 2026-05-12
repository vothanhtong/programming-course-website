import React, { useEffect, useState, useCallback, useRef } from 'react';
import CourseCard from '../CourseCard/CourseCard';
import courseApi from '../../api/courseApi';
import type { Course, Category } from '../../types';

const CoursesSection: React.FC = () => {
  const [courses, setCourses]               = useState<Course[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]                 = useState('');
  const [loading, setLoading]               = useState(true);
  const [page, setPage]                     = useState(1);
  const [total, setTotal]                   = useState(0);
  const perPage = 9;
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    courseApi.getCategories().then(r => setCategories(r.categories || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchCourses(1, activeCategory, search); }, [activeCategory]);

  const fetchCourses = useCallback(async (p: number, cat: string, q: string) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: p, perPage };
      if (cat !== 'all') params.category = cat;
      if (q.trim()) params.search = q.trim();
      const res = await courseApi.getCourses(params);
      setCourses(res.courses || []);
      setTotal(res.total || 0);
      setPage(p);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchCourses(1, activeCategory, val), 400);
  };

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    fetchCourses(1, catId, search);
  };

  const totalPages = Math.ceil(total / perPage);

  return (
    <section className="section" id="courses"
      style={{ background: 'linear-gradient(180deg, #0a0f1e 0%, #0f172a 100%)' }}>
      <div className="container">
        <div className="text-center mb-12">
          <span className="tag tag-blue mb-4">📚 Khóa học</span>
          <h2 className="section-title">Khám phá khóa học</h2>
          <p className="section-subtitle">Hơn 50 khóa học được thiết kế bài bản, cập nhật liên tục theo xu hướng công nghệ mới nhất</p>
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
              className="w-full pl-11 pr-4 py-2.5 rounded-full text-sm outline-none transition-all"
              style={{
                background: 'rgba(15,23,42,0.6)',
                border: '1px solid rgba(59,130,246,0.2)',
                color: '#e2e8f0',
              }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2.5 justify-center mb-10">
          {[{ _id: 'all', name: 'Tất cả', icon: '' }, ...categories].map((cat) => {
            const isActive = activeCategory === cat._id;
            const catWithIcon = cat as Category & { icon?: string };
            return (
              <button
                key={cat._id}
                onClick={() => handleCategoryChange(cat._id)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border"
                style={{
                  background: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(15,23,42,0.6)',
                  borderColor: isActive ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.15)',
                  color: isActive ? '#60a5fa' : '#64748b',
                  boxShadow: isActive ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                }}
              >
                {catWithIcon.icon && <span className="mr-1">{catWithIcon.icon}</span>}
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl animate-pulse"
                style={{ background: 'linear-gradient(135deg, rgba(30,41,59,0.8), rgba(15,23,42,0.8))' }} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20" style={{ color: '#475569' }}>
            <div className="text-5xl mb-4">📭</div>
            <p>Chưa có khóa học nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => <CourseCard key={course._id} course={course} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => fetchCourses(i + 1, activeCategory, search)}
                className="w-10 h-10 rounded-lg text-sm font-semibold transition-all cursor-pointer border"
                style={{
                  background: page === i + 1 ? 'rgba(59,130,246,0.25)' : 'rgba(15,23,42,0.6)',
                  borderColor: page === i + 1 ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.15)',
                  color: page === i + 1 ? '#60a5fa' : '#64748b',
                  boxShadow: page === i + 1 ? '0 0 12px rgba(59,130,246,0.2)' : 'none',
                }}
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
