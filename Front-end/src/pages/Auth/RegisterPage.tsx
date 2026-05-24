import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import AuthLayout from '../../components/ui/Auth/AuthLayout';
import AuthInput from '../../components/ui/Auth/AuthInput';
import { AuthAlert } from './LoginPage';

const RegisterPage: React.FC = () => {
  const { register  } = useAuthStore();
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

  return (
    <AuthLayout title="Tạo tài khoản" subtitle="Bắt đầu hành trình học tập của bạn" glowPosition="bottom-left">
      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthInput
          label="Họ và tên"
          type="text"
          placeholder="Nguyễn Văn A"
          value={form.fullName}
          onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          required
        />

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
          placeholder="Ít nhất 6 ký tự"
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

        <AuthInput
          label="Xác nhận mật khẩu"
          type="password"
          placeholder="Nhập lại mật khẩu"
          value={form.confirm}
          onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
          required
          style={{
            borderColor: form.confirm && form.confirm !== form.password
              ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.2)',
          }}
        />

        {error && <AuthAlert message={error} />}

        <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold mt-2">
          {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: '#475569' }}>
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold no-underline" style={{ color: '#60a5fa' }}>Đăng nhập</Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
