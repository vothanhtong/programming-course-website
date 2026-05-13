import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../api/authApi';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';

type Tab = 'profile' | 'courses' | 'messages' | 'password';

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

const ProfilePage: React.FC = () => {
  const { student, loading, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  // ── All hooks must be declared before any early return ──
  const [tab, setTab] = useState<Tab>('profile');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone:    '',
    bio:      '',
    avatar:   '',
  });
  const [profileMsg, setProfileMsg]         = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwMsg, setPwMsg]         = useState('');
  const [pwError, setPwError]     = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const [myMessages, setMyMessages]   = useState<any[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [newMsg, setNewMsg]           = useState('');
  const [sendingMsg, setSendingMsg]   = useState(false);
  const [msgSentOk, setMsgSentOk]     = useState('');
  const [msgError, setMsgError]       = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync profileForm khi student load xong
  useEffect(() => {
    if (student) {
      setProfileForm({
        fullName: student.fullName || '',
        phone:    student.phone    || '',
        bio:      student.bio      || '',
        avatar:   student.avatar   || '',
      });
    }
  }, [student]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!loading && !student) {
      navigate('/login', { state: { from: '/profile' } });
    }
  }, [loading, student, navigate]);

  const fetchMyMessages = useCallback(async () => {
    if (!student?.email) return;
    setMsgsLoading(true);
    try {
      const res = await authApi.getMyMessages(student.email);
      setMyMessages(res.messages || []);
    } catch {
      // silent
    } finally {
      setMsgsLoading(false);
    }
  }, [student?.email]);

  useEffect(() => {
    if (tab === 'messages') fetchMyMessages();
  }, [tab, fetchMyMessages]);

  useEffect(() => {
    if (tab === 'messages') {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  }, [myMessages, tab]);

  const handleLogout = useCallback(() => { logout(); navigate('/'); }, [logout, navigate]);

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !student) return;
    setSendingMsg(true); setMsgError(''); setMsgSentOk('');
    try {
      await axiosClient.post('/apis/messages', {
        name:    student.fullName,
        email:   student.email,
        phone:   student.phone || '',
        message: newMsg.trim(),
      });
      setNewMsg('');
      setMsgSentOk('Tin nhắn đã gửi! Admin sẽ trả lời sớm.');
      await fetchMyMessages();
    } catch (err: any) {
      setMsgError(err?.message || 'Gửi thất bại, vui lòng thử lại');
    } finally { setSendingMsg(false); }
  };

  // ── Early return AFTER all hooks ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#020817' }}>
      <div style={{ color: '#60a5fa', fontSize: 16 }}>Đang tải...</div>
    </div>
  );

  if (!student) return null;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile',  label: 'Hồ sơ',    icon: '👤' },
    { key: 'courses',  label: 'Khóa học',  icon: '📚' },
    { key: 'messages', label: 'Tin nhắn',  icon: '💬' },
    { key: 'password', label: 'Mật khẩu', icon: '🔒' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16"
        style={{ background: 'linear-gradient(135deg, #020817 0%, #0f172a 60%, #0d1526 100%)' }}>
        <div className="fixed inset-0 pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div className="fixed top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="fixed bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="container relative z-10">
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-white">Tài khoản của tôi</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Quản lý thông tin cá nhân và khóa học</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="rounded-2xl p-6 text-center" style={cardStyle}>
                <div className="relative inline-block mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto flex items-center justify-center text-white text-3xl font-bold"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
                    {student.avatar
                      ? <img src={student.avatar} alt={student.fullName} className="w-full h-full object-cover" />
                      : student.fullName[0]?.toUpperCase()}
                  </div>
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

              <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left"
                    style={{
                      color: tab === t.key ? '#60a5fa' : '#94a3b8',
                      background: tab === t.key ? 'rgba(59,130,246,0.1)' : 'transparent',
                      borderLeft: tab === t.key ? '3px solid #3b82f6' : '3px solid transparent',
                    }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }} />
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all bg-transparent border-none cursor-pointer text-left"
                  style={{ color: '#f87171', borderLeft: '3px solid transparent' }}
                  onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}>
                  <span>🚪</span>Đăng xuất
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">

              {/* Profile tab */}
              {tab === 'profile' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">👤 Thông tin cá nhân</h2>
                  <form onSubmit={handleProfileSave} className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>Ảnh đại diện (URL)</label>
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
                        className={inputCls} style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
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

              {/* Courses tab */}
              {tab === 'courses' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">📚 Khóa học của tôi</h2>
                  {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {student.enrolledCourses.map((c: any) => (
                        <Link key={c._id} to={`/courses/${c.slug}`}
                          className="flex items-center gap-4 p-4 rounded-xl no-underline transition-all duration-200"
                          style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(59,130,246,0.12)' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.4)'; (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(30,41,59,0.6)'; }}>
                          <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center text-2xl"
                            style={{ background: 'rgba(59,130,246,0.15)' }}>
                            {c.thumbnail ? <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" /> : '📚'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold truncate text-white">{c.title}</div>
                            <div className="text-xs mt-1 flex items-center gap-1" style={{ color: '#60a5fa' }}>Tiếp tục học →</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="text-5xl mb-4">📭</div>
                      <p className="mb-6 text-sm" style={{ color: '#64748b' }}>Bạn chưa đăng ký khóa học nào</p>
                      <Link to="/#courses" className="btn btn-primary">Khám phá khóa học</Link>
                    </div>
                  )}
                </div>
              )}

              {/* Messages tab */}
              {tab === 'messages' && (
                <div className="rounded-2xl overflow-hidden" style={cardStyle}>
                  <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2 m-0">💬 Tin nhắn với Admin</h2>
                    <p className="text-xs mt-1 m-0" style={{ color: '#64748b' }}>Gửi câu hỏi — admin sẽ trả lời tại đây</p>
                  </div>

                  <div style={{ minHeight: 320, maxHeight: 420, overflowY: 'auto', padding: '20px 20px 8px', background: 'rgba(2,8,23,0.3)' }}>
                    {msgsLoading ? (
                      <div className="text-center py-12" style={{ color: '#64748b' }}>Đang tải...</div>
                    ) : myMessages.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="text-4xl mb-3">💬</div>
                        <p style={{ color: '#64748b', fontSize: 14 }}>Chưa có tin nhắn nào. Hãy gửi câu hỏi đầu tiên!</p>
                      </div>
                    ) : (
                      [...myMessages].reverse().map((msg: any) => (
                        <div key={msg._id} className="mb-5">
                          {/* User bubble */}
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>
                              {student.fullName[0]?.toUpperCase()}
                            </div>
                            <div style={{ maxWidth: '75%' }}>
                              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3 }}>
                                Bạn · {new Date(msg.createdAt).toLocaleString('vi-VN')}
                              </div>
                              <div style={{ padding: '10px 14px', borderRadius: '4px 16px 16px 16px', background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.15)', color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {msg.message}
                              </div>
                            </div>
                          </div>
                          {/* Admin reply bubble */}
                          {msg.adminReply && (
                            <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 8 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 12 }}>A</div>
                              <div style={{ maxWidth: '75%' }}>
                                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 3, textAlign: 'right' }}>
                                  Admin · {new Date(msg.repliedAt).toLocaleString('vi-VN')}
                                </div>
                                <div style={{ padding: '10px 14px', borderRadius: '16px 4px 16px 16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(29,78,216,0.15))', border: '1px solid rgba(59,130,246,0.3)', color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                  {msg.adminReply}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <div style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }}>
                    <form onSubmit={handleSendMessage} className="p-4">
                      {msgSentOk && (
                        <div className="mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>{msgSentOk}</div>
                      )}
                      {msgError && (
                        <div className="mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>{msgError}</div>
                      )}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <textarea rows={2} placeholder="Nhập câu hỏi của bạn..." value={newMsg}
                          onChange={e => { setNewMsg(e.target.value); setMsgSentOk(''); setMsgError(''); }}
                          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendMessage(e as any); }}
                          className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none"
                          style={{ flex: 1, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(59,130,246,0.2)', color: '#e2e8f0' }}
                          onFocus={onFocus} onBlur={onBlur} />
                        <button type="submit" disabled={sendingMsg || !newMsg.trim()}
                          className="btn btn-primary px-5 py-3 flex-shrink-0" style={{ borderRadius: 12 }}>
                          {sendingMsg ? '...' : '➤'}
                        </button>
                      </div>
                      <p className="text-xs mt-2 m-0" style={{ color: '#475569' }}>Ctrl + Enter để gửi nhanh</p>
                    </form>
                  </div>
                </div>
              )}

              {/* Password tab */}
              {tab === 'password' && (
                <div className="rounded-2xl p-8" style={cardStyle}>
                  <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">🔒 Đổi mật khẩu</h2>
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
                        style={{ ...inputStyle, borderColor: pwForm.confirm && pwForm.confirm !== pwForm.newPassword ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.2)' }}
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
