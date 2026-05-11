import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

const navLinks = [
  { label: 'Khóa học',     id: 'courses' },
  { label: 'Về chúng tôi', id: 'about' },
  { label: 'Học viên',     id: 'testimonials' },
  { label: 'Liên hệ',      id: 'contact' },
];

const Navbar: React.FC = () => {
  const { student, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const handler = () => setUserMenuOpen(false);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [userMenuOpen]);

  const scrollTo = useCallback((id: string) => {
    setMenuOpen(false);
    // If not on homepage, navigate there first then scroll
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  }, [logout, navigate]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-3' : 'py-4'}`}
      style={{
        background: scrolled ? 'rgba(9,15,29,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(59,130,246,0.15)' : 'none',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div className="container flex items-center gap-8">
        <a href="/" aria-label="High Sky" className="flex-shrink-0">
          <Logo variant="light" size="sm" />
        </a>

        {/* Desktop nav */}
        <ul className="hidden md:flex list-none gap-1 ml-auto">
          {navLinks.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => scrollTo(link.id)}
                className="bg-transparent border-none px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#60a5fa'; (e.currentTarget).style.background = 'rgba(59,130,246,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget).style.color = '#94a3b8'; (e.currentTarget).style.background = 'transparent'; }}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Auth area */}
        <div className="hidden md:flex items-center gap-3">
          {student ? (
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-all border"
                style={{
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.25)',
                  color: '#e2e8f0',
                }}
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                  {student.avatar
                    ? <img src={student.avatar} alt={student.fullName} className="w-full h-full object-cover" />
                    : student.fullName[0]}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">{student.fullName}</span>
                <span className="text-xs" style={{ color: '#64748b' }}>▾</span>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden"
                  style={{
                    background: 'rgba(9,15,29,0.97)',
                    border: '1px solid rgba(59,130,246,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm bg-transparent border-none cursor-pointer transition-all text-left"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(59,130,246,0.1)'; (e.currentTarget).style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#94a3b8'; }}
                  >
                    👤 Hồ sơ của tôi
                  </button>
                  <button
                    onClick={() => { navigate('/profile'); setUserMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm bg-transparent border-none cursor-pointer transition-all text-left"
                    style={{ color: '#94a3b8' }}
                    onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(59,130,246,0.1)'; (e.currentTarget).style.color = '#e2e8f0'; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#94a3b8'; }}
                  >
                    📚 Khóa học của tôi
                  </button>
                  <div style={{ borderTop: '1px solid rgba(59,130,246,0.15)' }} />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm bg-transparent border-none cursor-pointer transition-all text-left"
                    style={{ color: '#f87171' }}
                    onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(239,68,68,0.1)'; }}
                    onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
                  >
                    🚪 Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-all bg-transparent border-none"
                style={{ color: '#94a3b8' }}
                onMouseEnter={e => { (e.currentTarget).style.color = '#60a5fa'; }}
                onMouseLeave={e => { (e.currentTarget).style.color = '#94a3b8'; }}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 text-sm font-medium rounded-xl cursor-pointer transition-all border"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(59,130,246,0.4)',
                  color: '#60a5fa',
                }}
                onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(59,130,246,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; }}
              >
                Đăng ký
              </button>
              <button className="btn btn-primary" onClick={() => scrollTo('courses')}>
                Bắt đầu học
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden ml-auto flex flex-col gap-1.5 bg-transparent border-none p-1 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="block w-6 h-0.5 transition-all duration-300"
              style={{
                background: '#94a3b8',
                transform: menuOpen
                  ? i === 0 ? 'rotate(45deg) translateY(8px)'
                  : i === 2 ? 'rotate(-45deg) translateY(-8px)'
                  : 'scaleX(0)'
                  : 'none',
                opacity: menuOpen && i === 1 ? 0 : 1,
              }}
            />
          ))}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-2 mt-2"
          style={{ background: 'rgba(9,15,29,0.97)', borderTop: '1px solid rgba(59,130,246,0.15)' }}
        >
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="bg-transparent border-none px-4 py-3 text-base font-medium text-left rounded-lg cursor-pointer"
              style={{ color: '#94a3b8' }}
            >
              {link.label}
            </button>
          ))}

          {student ? (
            <>
              <div style={{ borderTop: '1px solid rgba(59,130,246,0.15)', margin: '4px 0' }} />
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false); }}
                className="bg-transparent border-none px-4 py-3 text-base font-medium text-left rounded-lg cursor-pointer"
                style={{ color: '#94a3b8' }}
              >
                👤 {student.fullName}
              </button>
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className="bg-transparent border-none px-4 py-3 text-base font-medium text-left rounded-lg cursor-pointer"
                style={{ color: '#f87171' }}
              >
                🚪 Đăng xuất
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { navigate('/login'); setMenuOpen(false); }}
                className="bg-transparent border-none px-4 py-3 text-base font-medium text-left rounded-lg cursor-pointer"
                style={{ color: '#94a3b8' }}
              >
                Đăng nhập
              </button>
              <button
                onClick={() => { navigate('/register'); setMenuOpen(false); }}
                className="px-4 py-3 text-base font-medium text-left rounded-lg cursor-pointer border"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#60a5fa',
                }}
              >
                Đăng ký
              </button>
              <button className="btn btn-primary mt-2" onClick={() => scrollTo('courses')}>
                Bắt đầu học
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
