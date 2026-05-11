import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Logo from '../../components/Navbar/Logo';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ fullName: '', email: '', password: '', confirm: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Mật khẩu xác nhận không khớp'); return; }
    if (form.password.length < 6) { setError('Mật khẩu phải ít nhất 6 ký tự'); return; }
    setLoading(true);
    try {
      await register(form.fullName, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Đăng ký thất bại');
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

            <h1 className="text-2xl font-extrabold text-white text-center mb-1">Tạo tài khoản</h1>
            <p className="text-center text-sm mb-8" style={{ color: '#64748b' }}>Bắt đầu hành trình học tập của bạn</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Họ và tên</label>
                <input type="text" placeholder="Nguyễn Văn A" value={form.fullName} required
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
                <input type="email" placeholder="email@example.com" value={form.email} required
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Mật khẩu</label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự" value={form.password} required
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                    style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
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
                  type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} required
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    ...inputStyle,
                    borderColor: form.confirm && form.confirm !== form.password
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

              <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold mt-2">
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: '#475569' }}>
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-semibold no-underline" style={{ color: '#60a5fa' }}>Đăng nhập</Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default RegisterPage;
