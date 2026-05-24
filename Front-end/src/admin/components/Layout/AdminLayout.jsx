import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, ConfigProvider, Drawer } from 'antd';
import {
  DashboardOutlined, BookOutlined, TeamOutlined,
  StarOutlined, TagsOutlined, UserOutlined,
  LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  UsergroupAddOutlined, SettingOutlined, MessageOutlined, CheckSquareOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const { Sider, Content } = Layout;

// ── Dark theme tokens ──────────────────────────────────────
const DARK = {
  bg:         '#020817',
  sidebar:    '#0a1628',
  header:     'rgba(9,15,29,0.95)',
  card:       'rgba(15,23,42,0.9)',
  border:     'rgba(59,130,246,0.15)',
  borderHover:'rgba(59,130,246,0.4)',
  text:       '#e2e8f0',
  textMuted:  '#64748b',
  textSub:    '#94a3b8',
  blue:       '#3b82f6',
  blueHover:  'rgba(59,130,246,0.12)',
};

const menuItems = [
  { key: '/admin',            icon: <DashboardOutlined />,    label: 'Tổng quan' },
  { key: '/admin/courses',     icon: <BookOutlined />,         label: 'Khóa học' },
  { key: '/admin/students',    icon: <UsergroupAddOutlined />, label: 'Học viên' },
  { key: '/admin/enrollments', icon: <TeamOutlined />,         label: 'Đăng ký' },
  { key: '/admin/categories',  icon: <TagsOutlined />,         label: 'Danh mục' },
  { key: '/admin/quizzes',     icon: <CheckSquareOutlined />,  label: 'Trắc nghiệm' },
  { key: '/admin/messages',    icon: <MessageOutlined />,      label: 'Tin nhắn' },
  { type: 'divider' },
];

const LogoSVG = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
    <defs>
      <linearGradient id="asg1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <linearGradient id="asg2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" /><stop offset="100%" stopColor="#60a5fa" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="36" r="30" stroke="url(#asg1)" strokeWidth="2.5" fill="none" opacity="0.8" />
    <path d="M14 54 Q40 48 66 54" stroke="url(#asg1)" strokeWidth="2" strokeLinecap="round" fill="none" />
    <path d="M14 58 Q40 52 66 58" stroke="url(#asg2)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    <text x="10" y="42" fontFamily="monospace" fontWeight="700" fontSize="11" fill="url(#asg1)" opacity="0.6">&lt;/&gt;</text>
    <text x="22" y="52" fontFamily="Georgia, serif" fontWeight="900" fontSize="38" fontStyle="italic" fill="url(#asg1)">T</text>
    <text x="42" y="48" fontFamily="Georgia, serif" fontWeight="900" fontSize="28" fontStyle="italic" fill="url(#asg2)">T</text>
    <rect x="62" y="14" width="5" height="5" fill="#60a5fa" opacity="0.9" />
    <rect x="68" y="10" width="4" height="4" fill="#3b82f6" opacity="0.7" />
    <rect x="68" y="16" width="3" height="3" fill="#93c5fd" opacity="0.6" />
    <rect x="62" y="8"  width="3" height="3" fill="#60a5fa" opacity="0.5" />
  </svg>
);

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const { admin, logout } = useAuth();

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 992px)');
    setIsMobile(mql.matches);
    const handler = (e) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleLogout = async () => { await logout(); navigate('/admin/login'); };

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'Hồ sơ của tôi', onClick: () => navigate('/admin/profile') },
      { type: 'divider' },
      { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', danger: true, onClick: handleLogout },
    ],
  };

  const sideW = isMobile ? 0 : (collapsed ? 72 : 240);

  const sidebarContent = (isDrawer = false) => (
    <div style={{
      width: isDrawer ? 260 : (collapsed ? 72 : 240),
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: DARK.sidebar,
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div
        onClick={() => { navigate('/admin'); if (isDrawer) setDrawerOpen(false); }}
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: (!isDrawer && collapsed) ? 'center' : 'flex-start',
          padding: (!isDrawer && collapsed) ? 0 : '0 16px',
          gap: 10,
          cursor: 'pointer',
          borderBottom: `1px solid ${DARK.border}`,
          flexShrink: 0,
        }}
      >
        <LogoSVG size={36} />
        {(isDrawer || !collapsed) && (
          <div style={{ lineHeight: 1.25, overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.04em', whiteSpace: 'nowrap', color: '#60a5fa' }}>
              Khóa Học Lập Trình
            </div>
            <div style={{ fontSize: 8.5, color: DARK.textMuted, whiteSpace: 'nowrap' }}>
              Admin Dashboard
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 0' }}>
        {menuItems.map(item => {
          const isActive = location.pathname === item.key;
          return (
            <div
              key={item.key}
              onClick={() => { navigate(item.key); if (isDrawer) setDrawerOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: (!isDrawer && collapsed) ? '12px 0' : '10px 16px',
                justifyContent: (!isDrawer && collapsed) ? 'center' : 'flex-start',
                margin: '2px 8px',
                borderRadius: 8,
                cursor: 'pointer',
                background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                color: isActive ? '#60a5fa' : DARK.textSub,
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {(isDrawer || !collapsed) && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          );
        })}
      </div>

      {/* Bottom profile */}
      <div
        onClick={() => { navigate('/admin/profile'); if (isDrawer) setDrawerOpen(false); }}
        style={{
          padding: (!isDrawer && collapsed) ? '12px 0' : '12px 16px',
          borderTop: `1px solid ${DARK.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: (!isDrawer && collapsed) ? 'center' : 'flex-start',
          gap: 10,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Avatar
          size={32}
          src={admin?.avatar}
          icon={!admin?.avatar && <UserOutlined />}
          style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', flexShrink: 0 }}
        />
        {(isDrawer || !collapsed) && (
          <>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: DARK.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {admin?.fullName || admin?.userName}
              </div>
              <div style={{ fontSize: 11, color: DARK.textMuted }}>Quản trị viên</div>
            </div>
            <SettingOutlined style={{ color: DARK.textMuted, fontSize: 14, flexShrink: 0 }} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorBgBase: DARK.bg,
          colorTextBase: DARK.text,
          borderRadius: 8,
          fontFamily: "'Inter', -apple-system, sans-serif",
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(59,130,246,0.15)',
            darkItemHoverBg: 'rgba(59,130,246,0.08)',
            darkItemColor: DARK.textSub,
            darkItemSelectedColor: '#60a5fa',
            darkItemHoverColor: '#93c5fd',
            itemBorderRadius: 8,
          },
        },
      }}
    >
      <div style={{ display: 'flex', minHeight: '100vh', background: DARK.bg }}>

        {/* ── Sidebar Desktop ── */}
        {!isMobile && (
          <div style={{
            width: sideW,
            minWidth: sideW,
            flexShrink: 0,
            position: 'fixed',
            left: 0, top: 0, bottom: 0,
            zIndex: 100,
            borderRight: `1px solid ${DARK.border}`,
            transition: 'width 0.2s',
            overflow: 'hidden',
          }}>
            {sidebarContent(false)}
          </div>
        )}

        {/* ── Sidebar Mobile Drawer ── */}
        <Drawer
          placement="left"
          closable={false}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={260}
          bodyStyle={{ padding: 0, background: DARK.sidebar }}
          styles={{ body: { padding: 0, background: DARK.sidebar } }}
        >
          {sidebarContent(true)}
        </Drawer>

        {/* ── Main area ── */}
        <div style={{ flex: 1, marginLeft: sideW, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.2s', minWidth: 0, maxWidth: '100%' }}>

          {/* Header */}
          <div style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: isMobile ? '0 16px' : '0 24px',
            background: DARK.header,
            borderBottom: `1px solid ${DARK.border}`,
            backdropFilter: 'blur(12px)',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            flexShrink: 0,
          }}>
            <button
              onClick={() => isMobile ? setDrawerOpen(!drawerOpen) : setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: DARK.textSub,
                fontSize: 18,
                padding: '6px 8px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = DARK.blueHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {(isMobile ? drawerOpen : collapsed) ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>

            <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  cursor: 'pointer', padding: '6px 10px', borderRadius: 10,
                  border: `1px solid ${DARK.border}`,
                  background: 'rgba(59,130,246,0.06)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = DARK.blueHover; e.currentTarget.style.borderColor = DARK.borderHover; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.06)'; e.currentTarget.style.borderColor = DARK.border; }}
              >
                <Avatar
                  size={32}
                  src={admin?.avatar}
                  icon={!admin?.avatar && <UserOutlined />}
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}
                />
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: DARK.text }}>
                    {admin?.fullName || admin?.userName}
                  </div>
                  <div style={{ fontSize: 11, color: DARK.textMuted }}>Quản trị viên</div>
                </div>
                <span style={{ color: DARK.textMuted, fontSize: 10 }}>▾</span>
              </div>
            </Dropdown>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            padding: isMobile ? '16px 12px' : 24,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: DARK.bg,
            // Grid background like frontend
            backgroundImage: 'linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}>
            <Outlet />
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
};

export default AdminLayout;
