import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Logo from '../../components/Navbar/Logo';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail]     = useState('');
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setMsg(res.message);
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra');
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
        <div className="fixed top-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', filter: 'blur(40px)' }} />

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

            <h1 className="text-2xl font-extrabold text-white text-center mb-1">Quên mật khẩu</h1>
            <p className="text-center text-sm mb-8" style={{ color: '#64748b' }}>
              Nhập email để nhận hướng dẫn đặt lại mật khẩu
            </p>

            {msg ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <p className="font-semibold mb-6" style={{ color: '#34d399' }}>{msg}</p>
                <Link to="/login" className="btn btn-primary">Quay lại đăng nhập</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
                  <input
                    type="email" placeholder="email@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur}
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

                <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold">
                  {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
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

export default ForgotPasswordPage;
