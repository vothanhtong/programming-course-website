import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/ui/Auth/AuthLayout';
import AuthInput from '../../components/ui/Auth/AuthInput';

const LoginPage: React.FC = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = (location.state as any)?.from || '/';

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng bạn trở lại!" glowPosition="top-right">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />

        <AuthInput
          label="Mật khẩu"
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          required
          suffix={
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base"
              style={{ color: '#475569' }}>
              {showPw ? '🙈' : '👁'}
            </button>
          }
        />

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm no-underline" style={{ color: '#60a5fa' }}>
            Quên mật khẩu?
          </Link>
        </div>

        {error && <AuthAlert message={error} />}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold mt-2">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#475569' }}>
        Chưa có tài khoản?{' '}
        <Link to="/register" className="font-semibold no-underline" style={{ color: '#60a5fa' }}>
          Đăng ký ngay
        </Link>
      </p>
    </AuthLayout>
  );
};

export const AuthAlert: React.FC<{ message: string; success?: boolean }> = ({ message, success }) => (
  <div className="px-4 py-2.5 rounded-xl text-sm" style={{
    background: success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
    border: `1px solid ${success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
    color: success ? '#34d399' : '#f87171',
  }}>
    {message}
  </div>
);

export default LoginPage;
