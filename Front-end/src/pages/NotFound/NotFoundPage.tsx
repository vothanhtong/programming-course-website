import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-20 pb-16 bg-slate-50 dark:bg-transparent relative">
        <div className="absolute inset-0 dark:bg-dark-gradient pointer-events-none -z-20" />
        
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-5 dark:opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="text-9xl font-extrabold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                404
              </div>
              <div className="text-6xl mb-6">🔍</div>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t('notFound.title', 'Trang không tồn tại')}
            </h1>
            <p className="text-lg mb-8 text-slate-600 dark:text-slate-400">
              {t('notFound.desc', 'Rất tiếc, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.')}
              <br />
              {t('notFound.subDesc', 'Có thể trang đã bị xóa hoặc đường dẫn không chính xác.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary px-8 py-3 text-base"
              >
                🏠 {t('notFound.goHome', 'Về trang chủ')}
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="px-8 py-3 rounded-xl text-base font-semibold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[rgba(59,130,246,0.1)] dark:border-[rgba(59,130,246,0.3)] dark:text-blue-400 dark:hover:bg-[rgba(59,130,246,0.2)] dark:hover:border-[rgba(59,130,246,0.5)]"
              >
                ← {t('notFound.goBack', 'Quay lại')}
              </button>
            </div>

            {/* Helpful Links */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-[rgba(59,130,246,0.15)]">
              <p className="text-sm mb-4 text-slate-500 dark:text-slate-400">
                {t('notFound.helpLinks', 'Hoặc khám phá các trang phổ biến:')}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {[
                  { label: '📚 Khóa học', path: '/#courses' },
                  { label: '👤 Tài khoản', path: '/profile' },
                  { label: '📊 Dashboard', path: '/dashboard' },
                  { label: '🎓 Khóa học của tôi', path: '/my-courses' },
                ].map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 dark:bg-[rgba(30,41,59,0.6)] dark:border-[rgba(59,130,246,0.15)] dark:text-slate-400 dark:hover:text-blue-400 dark:hover:border-[rgba(59,130,246,0.4)]"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default NotFoundPage;
