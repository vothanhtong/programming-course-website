import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    setError('');
    try {
      await login(values.userName, values.password);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#020817',
      backgroundImage: `
        linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px),
        radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.15), transparent 50%),
        radial-gradient(ellipse at 0% 100%, rgba(16,185,129,0.1), transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(236,72,153,0.1), transparent 50%)
      `,
      backgroundSize: '40px 40px, 40px 40px, 100% 100%, 100% 100%, 100% 100%',
      backgroundPosition: '0 0, 0 0, center, center, center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          border: '1px solid rgba(59,130,246,0.2)',
          background: 'rgba(15,23,42,0.95)',
          backdropFilter: 'blur(12px)',
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            {/* HS SVG Logo */}
            <svg width="64" height="64" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
                <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>
              <circle cx="40" cy="36" r="30" stroke="url(#g1)" strokeWidth="3" fill="none" opacity="0.8" />
              <path d="M14 54 Q40 48 66 54" stroke="url(#g1)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M14 58 Q40 52 66 58" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" fill="none" />
              <text x="10" y="42" fontFamily="monospace" fontWeight="700" fontSize="11" fill="url(#g1)" opacity="0.7">&lt;/&gt;</text>
              <text x="22" y="52" fontFamily="Georgia, serif" fontWeight="900" fontSize="38" fontStyle="italic" fill="url(#g1)">T</text>
              <text x="42" y="48" fontFamily="Georgia, serif" fontWeight="900" fontSize="28" fontStyle="italic" fill="url(#g2)">T</text>
              <rect x="62" y="14" width="5" height="5" fill="#60a5fa" opacity="0.9" />
              <rect x="68" y="10" width="4" height="4" fill="#3b82f6" opacity="0.7" />
              <rect x="68" y="16" width="3" height="3" fill="#93c5fd" opacity="0.6" />
              <rect x="62" y="8"  width="3" height="3" fill="#60a5fa" opacity="0.5" />
            </svg>
          </div>
          <Title level={3} style={{ margin: 0, color: '#60a5fa' }}>
            Khóa Học Lập Trình
          </Title>
          <Text type="secondary" style={{ fontSize: 13, color: '#1a56db', fontWeight: 600, letterSpacing: '0.04em' }}>
            ADMIN DASHBOARD
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11, letterSpacing: '0.03em' }}>
            Học dễ hiểu – Ứng dụng thực tế – Đi xa cùng CODE
          </Text>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
        )}

        <Form layout="vertical" onFinish={onFinish} size="large">
          <Form.Item
            name="userName"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Tên đăng nhập"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Mật khẩu"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1a56db, #0f2057)',
                border: 'none',
                color: '#fff',
              }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
