import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import courseApi from '../../api/courseApi';
import type { Course, Lesson, Review, ReviewFormData } from '../../types';
import EnrollModal from '../../components/EnrollModal/EnrollModal';
import CourseDetailSkeleton from '../../components/Skeleton/CourseDetailSkeleton';
import NotFoundPage from '../NotFound/NotFoundPage';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import QuizTab from '../../components/Quiz/QuizTab';

const levelMap: Record<string, string> = {
  beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao',
};
const levelColor: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-red-100 text-red-700',
};

const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'md' }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map(i => (
      <span key={i} className={`${size === 'sm' ? 'text-sm' : 'text-base'} ${i <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
    ))}
  </div>
);

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} phút`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}p` : `${h} giờ`;
};

const CourseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [course, setCourse]   = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [activeTab, setActiveTab]   = useState<'overview' | 'lessons' | 'quizzes' | 'reviews'>('overview');
  const [reviewForm, setReviewForm] = useState<ReviewFormData>({ courseId: '', studentName: '', rating: 5, comment: '' });
  const [reviewSent, setReviewSent]       = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError]     = useState('');
  const [expandedLessons, setExpandedLessons] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    courseApi.getCourseDetail(slug)
      .then(res => {
        setCourse(res.course);
        setLessons(res.lessons);
        setReviews(res.reviews);
        setReviewForm(f => ({ ...f, courseId: res.course._id }));
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.studentName.trim()) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      await courseApi.postReview(reviewForm);
      setReviewSent(true);
      // Reload reviews để hiển thị thông báo chờ duyệt
      const res = await courseApi.getCourseDetail(slug!);
      setReviews(res.reviews);
    } catch (err: any) {
      setReviewError(err?.message || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <CourseDetailSkeleton />
      <Footer />
    </>
  );

  if (notFound) return (
    <>
      <Navbar />
      <NotFoundPage />
      <Footer />
    </>
  );

  if (!course) return null;

  const price    = course.salePrice != null ? course.salePrice : course.price;
  const category = typeof course.category === 'object' ? course.category : null;
  const displayedLessons = expandedLessons ? lessons : lessons.slice(0, 5);
  const totalDuration    = lessons.reduce((s, l) => s + l.duration, 0);

  return (
    <>
      <Navbar />
      <main className="flex-1 w-full pt-16 overflow-x-hidden lg:pb-0 pb-20">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <button onClick={() => navigate('/')} className="hover:text-white transition-colors bg-transparent border-none cursor-pointer text-gray-400">Trang chủ</button>
                  <span>/</span>
                  {category && <span className="text-gray-400">{(category as any).name}</span>}
                  {category && <span>/</span>}
                  <span className="text-white truncate">{course.title}</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColor[course.level]}`}>{levelMap[course.level]}</span>
                  {course.isFree && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Miễn phí</span>}
                  {course.isFeatured && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">⭐ Nổi bật</span>}
                </div>
                <h1 className="text-3xl font-extrabold mb-4 leading-tight">{course.title}</h1>
                <p className="text-gray-300 text-base leading-relaxed mb-6">{course.shortDescription}</p>
                <div className="flex flex-wrap items-center gap-5 text-sm text-gray-300 mb-6">
                  <div className="flex items-center gap-1.5">
                    <StarRating rating={course.rating} size="sm" />
                    <span className="text-yellow-400 font-semibold">{course.rating.toFixed(1)}</span>
                    <span>({course.ratingCount} đánh giá)</span>
                  </div>
                  <span>👥 {course.enrollmentCount.toLocaleString()} học viên</span>
                  <span>📚 {course.totalLessons} bài học</span>
                  {totalDuration > 0 && <span>⏱ {formatDuration(totalDuration)}</span>}
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden p-5">
                  <div className="text-3xl font-extrabold text-blue-600 mb-4">
                    {course.isFree ? <span className="text-green-500">Miễn phí</span> : `${price.toLocaleString('vi-VN')}đ`}
                  </div>
                  <button onClick={() => setEnrollOpen(true)} className="btn btn-primary w-full mb-3 py-3 text-base">Đăng ký ngay</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky enroll bar — visible only below lg */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between gap-4"
          style={{ background: 'rgba(9,15,29,0.97)', borderTop: '1px solid rgba(59,130,246,0.2)', backdropFilter: 'blur(12px)' }}>
          <div className="text-xl font-extrabold text-blue-400">
            {course.isFree ? <span className="text-green-400">Miễn phí</span> : `${price.toLocaleString('vi-VN')}đ`}
          </div>
          <button onClick={() => setEnrollOpen(true)} className="btn btn-primary px-6 py-2.5 text-sm flex-shrink-0">Đăng ký ngay</button>
        </div>

        <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
          <div className="container">
            <div className="flex gap-0">
              {(['overview', 'lessons', 'quizzes'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-semibold border-b-2 transition-all bg-transparent cursor-pointer ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                  {tab === 'overview' ? 'Tổng quan' : tab === 'lessons' ? `Bài học (${lessons.length})` : 'Trắc nghiệm'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="container py-10">
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-3xl">
              {course.outcomes && course.outcomes.length > 0 && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <h2 className="text-lg font-bold mb-4">🎯 Bạn sẽ học được gì?</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {course.outcomes.map((o, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span><span>{o}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {course.description && (
                <div>
                  <h2 className="text-lg font-bold mb-3">📖 Mô tả khóa học</h2>
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{course.description}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="max-w-3xl">
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                {displayedLessons.map((lesson, i) => (
                  <div key={lesson._id} className={`flex items-center gap-4 px-5 py-4 ${i < displayedLessons.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${lesson.isFree ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      {lesson.isFree ? '▶' : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{lesson.order}. {lesson.title}</div>
                    </div>
                    <div className="text-xs text-gray-400 flex-shrink-0">{formatDuration(lesson.duration)}</div>
                  </div>
                ))}
              </div>
              {lessons.length > 5 && (
                <button onClick={() => setExpandedLessons(!expandedLessons)}
                  className="mt-4 w-full py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-all bg-transparent cursor-pointer">
                  {expandedLessons ? '▲ Thu gọn' : `▼ Xem thêm ${lessons.length - 5} bài học`}
                </button>
              )}
            </div>
          )}

          {activeTab === 'quizzes' && (
            <QuizTab courseId={course._id} />
          )}


        </div>
      </main>
      <Footer />
      {enrollOpen && <EnrollModal open={enrollOpen} onClose={() => setEnrollOpen(false)} course={course} />}
    </>
  );
};

export default CourseDetail;
