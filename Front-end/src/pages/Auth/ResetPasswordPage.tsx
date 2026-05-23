import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import authApi from '../../api/authApi';
import AuthLayout from '../../components/Auth/AuthLayout';
import AuthInput from '../../components/Auth/AuthInput';
import { AuthAlert } from './LoginPage';

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

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới của bạn" glowPosition="bottom-left">
      {msg ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">✅</div>
          <p className="font-semibold mb-2" style={{ color: '#34d399' }}>{msg}</p>
          <p className="text-sm" style={{ color: '#475569' }}>Đang chuyển hướng đến trang đăng nhập...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {!token && (
            <AuthAlert message="Link không hợp lệ. Yêu cầu lại tại trang quên mật khẩu." />
          )}

          <AuthInput
            label="Mật khẩu mới"
            type={showPw ? 'text' : 'password'}
            placeholder="Ít nhất 6 ký tự"
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
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
              borderColor: form.confirm && form.confirm !== form.newPassword
                ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.2)',
            }}
          />

          {error && <AuthAlert message={error} />}

          <button type="submit" disabled={loading || !token} className="btn btn-primary w-full py-3 text-base font-semibold">
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>

          <p className="text-center text-sm" style={{ color: '#475569' }}>
            <Link to="/login" className="no-underline" style={{ color: '#60a5fa' }}>← Quay lại đăng nhập</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ResetPasswordPage;
