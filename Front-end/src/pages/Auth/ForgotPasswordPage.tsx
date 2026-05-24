import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import authApi from '../../api/authApi';
import AuthLayout from '../../components/ui/Auth/AuthLayout';
import AuthInput from '../../components/ui/Auth/AuthInput';
import { AuthAlert } from './LoginPage';

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

  return (
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận hướng dẫn đặt lại mật khẩu"
      glowPosition="top-right"
    >
      {msg ? (
        <div className="text-center py-4">
          <div className="text-5xl mb-4">📧</div>
          <p className="font-semibold mb-6" style={{ color: '#34d399' }}>{msg}</p>
          <Link to="/login" className="btn btn-primary">Quay lại đăng nhập</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          {error && <AuthAlert message={error} />}

          <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 text-base font-semibold">
            {loading ? 'Đang gửi...' : 'Gửi hướng dẫn'}
          </button>

          <p className="text-center text-sm" style={{ color: '#475569' }}>
            <Link to="/login" className="no-underline" style={{ color: '#60a5fa' }}>← Quay lại đăng nhập</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
