import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

type Tab = 'profile' | 'courses' | 'password';

// ── Shared dark-theme input styles ──────────────────────────────────────────
const inputCls = 'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all';
const inputStyle: React.CSSProperties = {
  background: 'rgba(30,41,59,0.8)',
  border: '1px solid rgba(59,130,246,0.2)',
  color: '#e2e8f0',
};
const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.1)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
  e.currentTarget.style.boxShadow   = 'none';
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(59,130,246,0.15)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  backdropFilter: 'blur(12px)',
};

// ── Alert helper ─────────────────────────────────────────────────────────────
const Alert: React.FC<{ msg: string }> = ({ msg }) => {
  const ok = msg.includes('thành công');
  return (
    <div className="px-4 py-2.5 rounded-xl text-sm" style={{
      background: ok ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${ok ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
      color: ok ? '#34d399' : '#f87171',
    }}>
      {msg}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const ProfilePage: React.FC = () => {
  const { student, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');

  const [profileForm, setProfileForm] = useState({
    fullName: student?.fullName || '',
    phone:    student?.phone    || '',
    bio:      student?.bio      || '',
    avatar:   student?.avatar   || '',
  });
  const [profileMsg, setProfileMsg]         = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm]   = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg]     = useState('');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);

  if (!student) {
    navigate('/login', { state: { from: '/profile' } });
    return null;
  }

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true); setProfileMsg('');
    try {
      await updateProfile(profileForm);
      setProfileMsg('Cập nhật thành công!');
    } catch (err: any) {
      setProfileMsg(err?.message || 'Có lỗi xảy ra');
    } finally { setProfileLoading(false); }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwMsg('');
    if (pwForm.newPassword !== pwForm.confirm) { setPwError('Mật khẩu xác nhận không khớp'); return; }
    if (pwForm.newPassword.length < 6) { setPwError('Mật khẩu mới phải ít nhất 6 ký tự'); return; }
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg('Đổi mật khẩu thành công!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err: any) {
      setPwError(err?.message || 'Có lỗi xảy ra');
    } finally { setPwLoading(false); }
  };

  const handleLogout = useCallback(() => { logout(); navigate('/'); }, [logout, navigate]);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile',  label: 'Hồ sơ',    icon: '👤' },
    { key: 'courses',  label: 'Khóa học',  icon: '📚' },
    { key: 'password', label: 'Mật khẩu', icon: '🔒' },
  ];

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen pt-24 pb-16"
        style={{ background: 'linear-gradient(135deg, #020817 0%, #0f172a 60%, #0d1526 100%)' }}
      >
        {/* Grid bg */}
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {/* Glow orbs */}
        <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="container relative z-10">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white">Tài khoản của tôi</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Quản lý thông tin cá nhân và khóa học</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* ── Sidebar ── */}
            <div className="lg:col-span-1 space-y-4">
              {/* Avatar card */}
              <div className="rounded-2xl p-6 text-center" style={cardStyle}>
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                    {student.avatar
                      ? <img src={student.avatar} alt={student.fullName} className="w-full h-full object-cover" />
                      : student.fullName[0]?.toUpperCase()}
                  </div>
                  {/* Online dot */}
                  <span className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 bg-green-400"
                    style={{ borderColor: '#0f172a' }} />
                </div>
                <div className="font-bold text-base text-white">{student.fullName}</div>
                <div className="text-xs mt-1 truncate" style={{ color: '#64748b' }}>{student.email}</div>
                {student.enrolledCourses && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', color: '#60a5fa' }}>
                    📚 {student.enrolledCourses.length} khóa học
                  </div>
                )}
              </div>

              {/* Nav tabs */}
              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left"
                    style={{
                      color: tab === t.key ? '#60a5fa' : '#94a3b8',
                      background: tab === t.key ? 'rgba(59,130,246,0.1)' : 'transparent',
                      borderLeft: tab === t.key ? '3px solid #3b82f6' : '3px solid transparent',
                    }}
                  >
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }} />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left"
                  style={{ color: '#f87171', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
                >
                  <span>🚪</span>Đăng xuất
                </button>
              </div>
            </div>

            {/* ── Content ── */}
            <div className="lg:col-span-3">

              {/* ── Profile tab ── */}
              {tab === 'profile' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    👤 Thông tin cá nhân
                  </h2>
                  <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
                    {/* Avatar URL */}
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                        Ảnh đại diện (URL)
                      </label>
                      <input type="url" placeholder="https://..." value={profileForm.avatar}
                        onChange={e => setProfileForm(f => ({ ...f, avatar: e.target.value }))}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Họ và tên</label>
                      <input type="text" value={profileForm.fullName} required
                        onChange={e => setProfileForm(f => ({ ...f, fullName: e.target.value }))}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Email</label>
                      <input type="email" value={student.email} disabled
                        className={inputCls}
                        style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Số điện thoại</label>
                      <input type="tel" placeholder="0912 345 678" value={profileForm.phone}
                        onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Giới thiệu bản thân</label>
                      <textarea rows={3} placeholder="Chia sẻ đôi điều về bạn..." value={profileForm.bio}
                        onChange={e => setProfileForm(f => ({ ...f, bio: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-y"
                        style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {profileMsg && <Alert msg={profileMsg} />}

                    <button type="submit" disabled={profileLoading} className="btn btn-primary px-8">
                      {profileLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </form>
                </div>
              )}

              {/* ── Courses tab ── */}
              {tab === 'courses' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    📚 Khóa học của tôi
                  </h2>
                  {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {student.enrolledCourses.map((c: any) => (
                        <Link
                          key={c._id}
                          to={`/courses/${c.slug}`}
                          className="flex items-center gap-4 p-4 rounded-xl no-underline transition-all duration-200 group"
                          style={{
                            background: 'rgba(30,41,59,0.6)',
                            border: '1px solid rgba(59,130,246,0.12)',
                          }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.4)';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)';
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.12)';
                            (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.6)';
                          }}
                        >
                          <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
                            style={{ background: 'rgba(59,130,246,0.15)' }}>
                            {c.thumbnail
                              ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                              : '📚'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate text-white">{c.title}</div>
                            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: '#60a5fa' }}>
                              Tiếp tục học <span>→</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="mb-6 text-sm" style={{ color: '#64748b' }}>
                        Bạn chưa đăng ký khóa học nào
                      </p>
                      <Link to="/#courses" className="btn btn-primary">Khám phá khóa học</Link>
                    </div>
                  )}
                </div>
              )}

              {/* ── Password tab ── */}
              {tab === 'password' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    🔒 Đổi mật khẩu
                  </h2>
                  <form onSubmit={handlePasswordChange} className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Mật khẩu hiện tại</label>
                      <input type="password" value={pwForm.currentPassword} required
                        onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                        className={inputCls} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Mật khẩu mới</label>
                      <div className="relative">
                        <input type={showPw ? 'text' : 'password'} placeholder="Ít nhất 6 ký tự"
                          value={pwForm.newPassword} required
                          onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                          className={`${inputCls} pr-12`} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base"
                          style={{ color: '#475569' }}>
                          {showPw ? '🙈' : '👁'}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Xác nhận mật khẩu mới</label>
                      <input type="password" value={pwForm.confirm} required
                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                        className={inputCls}
                        style={{
                          ...inputStyle,
                          borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPassword
                            ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.2)',
                        }}
                        onFocus={onFocus} onBlur={onBlur} />
                    </div>

                    {pwError && <Alert msg={pwError} />}
                    {pwMsg   && <Alert msg={pwMsg} />}

                    <button type="submit" disabled={pwLoading} className="btn btn-primary px-8">
                      {pwLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ProfilePage;
