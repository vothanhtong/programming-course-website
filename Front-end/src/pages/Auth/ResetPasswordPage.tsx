import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../../api/authApi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Logo from '../../components/Navbar/Logo';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [form, setForm]       = useState({ newPassword: '', confirm: '' });
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    if (form.newPassword !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.newPassword.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    if (!token) { setError('Link đặt lại mật khẩu không hợp lệ'); return; }
    setLoading(true);
    try {
      const res = await authApi.resetPassword({ token, newPassword: form.newPassword });
      setMsg(res.message);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(59,130,246,0.2)',
    color: '#e2e8f0',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.1)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
    e.currentTarget.style.boxShadow   = 'none';
  };

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16"
        style={{ background: 'linear-gradient(135deg, #020817 0%, #0f172a 60%, #0d1526 100%)' }}
      >
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="relative z-10 w-full max-w-md">
          <div className="rounded-2xl p-8" style={{
            background: 'rgba(15,23,42,0.85)',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 0 40px rgba(59,130,246,0.1), 0 25px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
          }}>
            <div className="flex justify-center mb-8">
              <Logo variant="light" size="sm" />
            </div>

            <h1 className="text-2xl font-extrabold text-white text-center mb-1">Đặt lại mật khẩu</h1>
            <p className="text-center text-sm mb-8" style={{ color: '#64748b' }}>Nhập mật khẩu mới của bạn</p>

            {msg ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">✅</div>
                <p className="font-semibold mb-2" style={{ color: '#34d399' }}>{msg}</p>
                <p className="text-sm" style={{ color: '#475569' }}>Đang chuyển hướng đến trang đăng nhập...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {!token && (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}>
                    Link không hợp lệ.{' '}
                    <Link to="/forgot-password" style={{ color: '#f87171', textDecoration: 'underline' }}>Yêu cầu lại</Link>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự"
                      value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} required
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                      style={inputStyle} onFocus={onFocus} onBlur={onBlur}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base"
                      style={{ color: '#475569' }}>
                      {showPw ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Xác nhận mật khẩu</label>
                  <input
                    type="password" placeholder="Nhập lại mật khẩu"
                    value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      ...inputStyle,
                      borderColor: form.confirm && form.confirm !== form.newPassword
                        ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.2)',
                    }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>

                {error && (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !token} className="btn btn-primary w-full py-3 text-base font-semibold">
                  {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </button>

                <p className="text-center text-sm" style={{ color: '#475569' }}>
                  <Link to="/login" className="no-underline" style={{ color: '#60a5fa' }}>← Quay lại đăng nhập</Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ResetPasswordPage;
