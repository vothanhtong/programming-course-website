import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import StatCardSkeleton from '../../components/Skeleton/StatCardSkeleton';
import progressApi from '../../api/progressApi';
import { useAuth } from '../../context/AuthContext';
import type { LearningStats } from '../../api/progressApi';

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div
    className={`bg-gradient-to-br ${color} rounded-lg p-6 shadow-lg text-white transform hover:scale-105 transition-transform duration-200`}
  >
    <div className="text-4xl mb-2">{icon}</div>
    <div className="text-sm opacity-90">{title}</div>
    <div className="text-3xl font-bold">{value}</div>
  </div>
);

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { student, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect nếu chưa đăng nhập — dùng React Router thay vì hard redirect
  useEffect(() => {
    if (!authLoading && !student) {
      navigate('/login', { state: { from: '/dashboard' } });
    }
  }, [authLoading, student, navigate]);

  useEffect(() => {
    if (!student) return; // chờ auth xong mới fetch
    let isMounted = true;
    const fetchStats = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const { stats: data } = await progressApi.getLearningStats();
        if (isMounted) setStats(data);
      } catch {
        if (isMounted) setError('Không thể tải thống kê. Vui lòng thử lại.');
      } finally {
        if (isMounted && !isBackground) setLoading(false);
      }
    };
    fetchStats();
    
    const interval = setInterval(() => fetchStats(true), 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [student]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Navbar />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 mt-16 sm:mt-20 pb-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Dashboard Học Tập</h1>
          <p className="text-slate-400">Theo dõi tiến độ học tập của bạn</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-8 text-red-400">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <>
            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[...Array(4)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>

            {/* Progress Overview Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 animate-pulse">
                  <div className="h-3 bg-slate-600 rounded w-1/3 mb-2" />
                  <div className="h-8 bg-slate-600 rounded w-1/2 mb-4" />
                  <div className="h-2 bg-slate-600 rounded w-full" />
                </div>
              ))}
            </div>
          </>
        ) : stats ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard
                title="Khóa Học Đã Đăng Ký"
                value={stats.totalEnrolled}
                icon="📚"
                color="from-blue-600 to-blue-400"
              />
              <StatCard
                title="Đã Hoàn Thành"
                value={stats.totalCompleted}
                icon="✅"
                color="from-green-600 to-green-400"
              />
              <StatCard
                title="Tổng Bài Học"
                value={stats.totalLessons}
                icon="🎓"
                color="from-purple-600 to-purple-400"
              />
              <StatCard
                title="Tiến Độ Trung Bình"
                value={`${stats.averageProgress}%`}
                icon="📊"
                color="from-orange-600 to-orange-400"
              />
            </div>

            {/* Progress Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">Đang học</div>
                <div className="text-3xl font-bold text-blue-400">{stats.inProgress}</div>
                <div className="text-slate-500 text-xs mt-4">
                  Khóa học đang trong quá trình
                </div>
              </div>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">Bài Học Hoàn Thành</div>
                <div className="text-3xl font-bold text-green-400">
                  {stats.totalLessonsCompleted}/{stats.totalLessons}
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 mt-4">
                  <div
                    className="bg-green-400 h-2 rounded-full"
                    style={{
                      width: `${
                        stats.totalLessons > 0
                          ? (stats.totalLessonsCompleted / stats.totalLessons) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
                <div className="text-slate-400 text-sm mb-2">Chưa Bắt Đầu</div>
                <div className="text-3xl font-bold text-slate-400">{stats.notStarted}</div>
                <div className="text-slate-500 text-xs mt-4">
                  Khóa học chưa được bắt đầu
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/my-courses')}
                className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Xem Khóa Học Của Tôi →
              </button>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default StudentDashboard;
