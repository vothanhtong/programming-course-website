import React, { useState } from 'react';
import { message } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import adminApi from '../api/adminApi';
import ImageUploader from '../components/ImageUploader/ImageUploader';

// ── Dark theme shared styles ──────────────────────────────
const cardStyle = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(59,130,246,0.15)',
  borderRadius: 16,
  backdropFilter: 'blur(12px)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  border: '1px solid rgba(59,130,246,0.2)',
  background: 'rgba(30,41,59,0.8)',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#94a3b8',
  marginBottom: 6,
};

const DarkInput = ({ type = 'text', value, onChange, placeholder, disabled }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    style={{ ...inputStyle, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text' }}
    onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
    onBlur={e  => { e.target.style.borderColor = 'rgba(59,130,246,0.2)'; e.target.style.boxShadow = 'none'; }}
  />
);

const DarkPasswordInput = ({ value, onChange, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...inputStyle, paddingRight: 40 }}
        onFocus={e => { e.target.style.borderColor = 'rgba(59,130,246,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)'; }}
        onBlur={e  => { e.target.style.borderColor = 'rgba(59,130,246,0.2)'; e.target.style.boxShadow = 'none'; }}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: 15,
        }}
      >
        {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────
const AdminProfile = () => {
  const { admin, updateProfile } = useAuth();

  const [tab, setTab] = useState('profile');

  // Profile form
  const [profile, setProfile] = useState({
    fullName: admin?.fullName || '',
    email:    admin?.email    || '',
    phone:    admin?.phone    || '',
    fb:       admin?.fb       || '',
    address:  admin?.address  || '',
    avatar:   admin?.avatar   || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.fullName.trim()) { message.error('Vui lòng nhập họ tên'); return; }
    setProfileLoading(true);
    try {
      await updateProfile(profile);
      message.success('Cập nhật hồ sơ thành công!');
    } catch (err) {
      message.error(err?.message || 'Cập nhật thất bại');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pw.currentPassword || !pw.newPassword) { message.error('Vui lòng nhập đầy đủ'); return; }
    if (pw.newPassword !== pw.confirm) { message.error('Mật khẩu xác nhận không khớp'); return; }
    if (pw.newPassword.length < 6) { message.error('Mật khẩu mới phải ít nhất 6 ký tự'); return; }
    setPwLoading(true);
    try {
      await adminApi.changePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      message.success('Đổi mật khẩu thành công!');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      message.error(err?.message || 'Đổi mật khẩu thất bại');
    } finally { setPwLoading(false); }
  };

  const tabs = [
    { key: 'profile',  label: '👤 Thông tin cá nhân' },
    { key: 'password', label: '🔒 Đổi mật khẩu' },
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Page title */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e2e8f0', margin: 0 }}>Hồ sơ quản trị viên</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Quản lý thông tin tài khoản của bạn</p>
      </div>

      {/* Avatar card */}
      <div style={{ ...cardStyle, padding: '20px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 28, fontWeight: 700, overflow: 'hidden',
        }}>
          {admin?.avatar
            ? <img src={admin.avatar} alt={admin.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (admin?.fullName?.[0] || <UserOutlined />)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>{admin?.fullName || admin?.userName}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{admin?.email}</div>
          <div style={{ marginTop: 6, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 20,
              background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa',
            }}>
              @{admin?.userName}
            </span>
            <span style={{
              fontSize: 12, padding: '2px 10px', borderRadius: 20,
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399',
            }}>
              Quản trị viên
            </span>
          </div>
        </div>
      </div>

      {/* Tabs + Form card */}
      <div style={cardStyle}>
        {/* Tab bar */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid rgba(59,130,246,0.15)',
          padding: '0 24px',
        }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '14px 20px',
                fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? '#60a5fa' : '#64748b',
                borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form content */}
        <div style={{ padding: 28 }}>

          {/* ── Profile tab ── */}
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 600 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Ảnh đại diện</label>
                  <ImageUploader
                    value={profile.avatar}
                    onChange={url => setProfile(p => ({ ...p, avatar: url }))}
                    shape="circle"
                    size={100}
                    placeholder="Chọn ảnh"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Họ và tên <span style={{ color: '#f87171' }}>*</span></label>
                  <DarkInput
                    value={profile.fullName}
                    onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <DarkInput
                    type="email"
                    value={profile.email}
                    onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Số điện thoại</label>
                  <DarkInput
                    type="tel"
                    value={profile.phone}
                    onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="0912 345 678"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Facebook / Zalo</label>
                  <DarkInput
                    value={profile.fb}
                    onChange={e => setProfile(p => ({ ...p, fb: e.target.value }))}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Địa chỉ</label>
                  <DarkInput
                    value={profile.address}
                    onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                    placeholder="Hà Nội / TP. Hồ Chí Minh"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={profileLoading}
                style={{
                  marginTop: 20,
                  padding: '10px 28px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: profileLoading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: profileLoading ? 0.7 : 1,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <SaveOutlined />
                {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </form>
          )}

          {/* ── Password tab ── */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordChange} style={{ maxWidth: 420 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Mật khẩu hiện tại <span style={{ color: '#f87171' }}>*</span></label>
                  <DarkPasswordInput
                    value={pw.currentPassword}
                    onChange={e => setPw(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Mật khẩu mới <span style={{ color: '#f87171' }}>*</span></label>
                  <DarkPasswordInput
                    value={pw.newPassword}
                    onChange={e => setPw(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Xác nhận mật khẩu mới <span style={{ color: '#f87171' }}>*</span></label>
                  <DarkPasswordInput
                    value={pw.confirm}
                    onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))}
                    placeholder="Nhập lại mật khẩu"
                  />
                  {pw.confirm && pw.confirm !== pw.newPassword && (
                    <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Mật khẩu không khớp</p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                style={{
                  marginTop: 20,
                  padding: '10px 28px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg,#ef4444,#b91c1c)',
                  color: '#fff',
                  fontSize: 14,
                  fontWeight: 600,
                  opacity: pwLoading ? 0.7 : 1,
                }}
              >
                {pwLoading ? 'Đang đổi...' : '🔒 Đổi mật khẩu'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
