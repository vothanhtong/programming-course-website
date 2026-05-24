import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/layout/Navbar/Navbar';
import Footer from '../../components/layout/Footer/Footer';

const UnauthorizedPage: React.FC = () => {
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
            {/* 401 Icon */}
            <div className="mb-8">
              <div className="text-9xl font-extrabold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                401
              </div>
              <div className="text-6xl mb-6">🔒</div>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t('error.unauthorized.title', 'Yêu cầu đăng nhập')}
            </h1>
            <p className="text-lg mb-8 text-slate-600 dark:text-slate-400">
              {t('error.unauthorized.desc', 'Vui lòng đăng nhập để truy cập trang này.')}
              <br />
              {t('error.unauthorized.subDesc', 'Nếu bạn chưa có tài khoản, vui lòng đăng ký.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary px-8 py-3 text-base"
              >
                🔑 {t('error.unauthorized.login', 'Đăng nhập ngay')}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-xl text-base font-semibold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[rgba(59,130,246,0.1)] dark:border-[rgba(59,130,246,0.3)] dark:text-blue-400 dark:hover:bg-[rgba(59,130,246,0.2)] dark:hover:border-[rgba(59,130,246,0.5)]"
              >
                🏠 {t('notFound.goHome', 'Về trang chủ')}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default UnauthorizedPage;
