import React from 'react';

interface LogoProps {
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

const sizes = {
  sm: { icon: 36, text: 12 },
  md: { icon: 42, text: 14 },
  lg: { icon: 56, text: 18 },
};

const Logo: React.FC<LogoProps> = ({ variant = 'dark', size = 'md' }) => {
  const s = sizes[size];
  const nameColor   = variant === 'light' ? '#ffffff' : '#0f2057';
  const subColor    = variant === 'light' ? 'rgba(255,255,255,0.75)' : '#1a56db';
  const sloganColor = variant === 'light' ? 'rgba(255,255,255,0.55)' : '#64748b';

  return (
    <div className="flex items-center gap-2.5 no-underline select-none">
      {/* Icon SVG — TT logo inspired by the uploaded image */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 80 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Thanh Tòng Logo"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="ttGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f2057" />
            <stop offset="100%" stopColor="#1a3a8f" />
          </linearGradient>
          <linearGradient id="ttGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a56db" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>

        {/* Circle background */}
        <circle cx="40" cy="36" r="30" stroke="url(#ttGrad1)" strokeWidth="3" fill="none" />

        {/* Book pages at bottom */}
        <path d="M14 54 Q40 48 66 54" stroke="url(#ttGrad1)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M14 58 Q40 52 66 58" stroke="url(#ttGrad2)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Code tag </> */}
        <text x="10" y="42" fontFamily="monospace" fontWeight="700" fontSize="11" fill="url(#ttGrad1)" opacity="0.7">&lt;/&gt;</text>

        {/* Big T (dark navy) */}
        <text x="22" y="52" fontFamily="Georgia, serif" fontWeight="900" fontSize="38" fontStyle="italic" fill="url(#ttGrad1)">T</text>

        {/* Small T (blue gradient, offset) */}
        <text x="42" y="48" fontFamily="Georgia, serif" fontWeight="900" fontSize="28" fontStyle="italic" fill="url(#ttGrad2)">T</text>

        {/* Pixel dots (top right of small T) */}
        <rect x="62" y="14" width="5" height="5" fill="#3b82f6" opacity="0.9" />
        <rect x="68" y="10" width="4" height="4" fill="#3b82f6" opacity="0.7" />
        <rect x="68" y="16" width="3" height="3" fill="#60a5fa" opacity="0.6" />
        <rect x="62" y="8"  width="3" height="3" fill="#1a56db" opacity="0.5" />
      </svg>

      {/* Text */}
      <div className="leading-tight">
        <div
          className="font-extrabold uppercase tracking-wider"
          style={{ fontSize: s.text * 1.15, color: subColor }}
        >
          Khóa Học Lập Trình
        </div>
        {size !== 'sm' && (
          <div
            className="font-normal tracking-wide"
            style={{ fontSize: s.text * 0.7, color: sloganColor }}
          >
            Học dễ hiểu – Ứng dụng thực tế
          </div>
        )}
      </div>
    </div>
  );
};

export default Logo;
