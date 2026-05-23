import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Logo from '../Navbar/Logo';
import { AUTH_BG_GRADIENT, AUTH_CARD_STYLES, AUTH_GRID_BG } from '../../utils/constants';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  glowPosition?: 'top-right' | 'bottom-left';
}

/**
 * Shared layout component for authentication pages
 * Provides consistent styling and structure for login, register, forgot password pages
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  glowPosition = 'top-right',
}) => {
  const glowStyles = {
    'top-right': {
      top: '-150px',
      right: '-100px',
      width: '500px',
      height: '500px',
      background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
    },
    'bottom-left': {
      bottom: '-100px',
      left: '-100px',
      width: '400px',
      height: '400px',
      background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    },
  };

  return (
    <>
      <Navbar />
      <main
        className="min-h-screen flex items-center justify-center px-4 pt-20 pb-16"
        style={{ background: AUTH_BG_GRADIENT }}
      >
        {/* Grid background */}
        <div className="fixed inset-0 pointer-events-none" style={AUTH_GRID_BG} />

        {/* Glow effect */}
        <div
          className="fixed rounded-full pointer-events-none"
          style={{
            ...glowStyles[glowPosition],
            filter: 'blur(40px)',
          }}
        />

        <div className="relative z-10 w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl p-8" style={AUTH_CARD_STYLES}>
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <Logo variant="light" size="sm" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-extrabold text-white text-center mb-1">{title}</h1>
            <p className="text-center text-sm mb-8" style={{ color: '#64748b' }}>
              {subtitle}
            </p>

            {/* Content */}
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AuthLayout;
