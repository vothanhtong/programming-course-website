import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

const ServerErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center pt-20 pb-16 bg-slate-50 dark:bg-transparent relative">
        <div className="absolute inset-0 dark:bg-dark-gradient pointer-events-none -z-20" />
        
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none -z-10 opacity-5 dark:opacity-20" style={{
          backgroundImage: 'linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        
        <div className="container relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            {/* 500 Icon */}
            <div className="mb-8">
              <div className="text-9xl font-extrabold mb-4"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                500
              </div>
              <div className="text-6xl mb-6">⚙️</div>
            </div>

            {/* Content */}
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              {t('error.server.title', 'Lỗi máy chủ')}
            </h1>
            <p className="text-lg mb-8 text-slate-600 dark:text-slate-400">
              {t('error.server.desc', 'Đã có lỗi xảy ra từ phía hệ thống của chúng tôi.')}
              <br />
              {t('error.server.subDesc', 'Vui lòng thử lại sau ít phút.')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary px-8 py-3 text-base"
              >
                🔄 {t('error.server.retry', 'Tải lại trang')}
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 rounded-xl text-base font-semibold transition-all bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-[rgba(139,92,246,0.1)] dark:border-[rgba(139,92,246,0.3)] dark:text-purple-400 dark:hover:bg-[rgba(139,92,246,0.2)] dark:hover:border-[rgba(139,92,246,0.5)]"
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

export default ServerErrorPage;
