import React, { useState } from 'react';

const PHONE = '0917772494';
const ZALO_URL = `https://zalo.me/${PHONE}`;
const FACEBOOK_URL = 'https://www.facebook.com/thanh.tong.378542';

const FloatingContact: React.FC = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  const buttons = [
    {
      id: 'zalo',
      href: ZALO_URL,
      title: 'Chat Zalo',
      bg: '#0068FF',
      shadow: 'rgba(0,104,255,0.5)',
      icon: (
        <svg viewBox="0 0 48 48" width="26" height="26" fill="none">
          <rect width="48" height="48" rx="12" fill="white" fillOpacity="0.15"/>
          <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle"
            fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="white">
            Zalo
          </text>
        </svg>
      ),
    },
    {
      id: 'phone',
      href: `tel:${PHONE}`,
      title: 'Gọi điện',
      bg: 'linear-gradient(135deg, #1a1a2e, #16213e)',
      shadow: 'rgba(0,0,0,0.5)',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/>
        </svg>
      ),
    },
    {
      id: 'facebook',
      href: FACEBOOK_URL,
      title: 'Facebook Messenger',
      bg: 'linear-gradient(135deg, #7B2FBE, #4F46E5)',
      shadow: 'rgba(123,47,190,0.5)',
      icon: (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="white">
          <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.908 1.438 5.504 3.688 7.2V22l3.37-1.85c.9.25 1.854.385 2.942.385 5.523 0 10-4.145 10-9.243S17.523 2 12 2zm1.05 12.45l-2.55-2.72-4.98 2.72 5.48-5.82 2.61 2.72 4.92-2.72-5.48 5.82z"/>
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 80,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
      }}
      className="floating-contact"
    >
      {buttons.map((btn) => (
        <div key={btn.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Tooltip label - hidden on mobile */}
          {hovered === btn.id && (
            <div className="hidden sm:block" style={{
              background: 'rgba(15,23,42,0.92)',
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 8,
              border: '1px solid rgba(59,130,246,0.2)',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              animation: 'fadeIn 0.15s ease',
            }}>
              {btn.title}
            </div>
          )}

          {/* Button */}
          <a
            href={btn.href}
            target={btn.id !== 'phone' ? '_blank' : undefined}
            rel="noopener noreferrer"
            title={btn.title}
            onMouseEnter={() => setHovered(btn.id)}
            onMouseLeave={() => setHovered(null)}
            className="floating-btn"
            style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: btn.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: hovered === btn.id
                ? `0 6px 20px ${btn.shadow}, 0 0 0 4px rgba(255,255,255,0.1)`
                : `0 4px 14px ${btn.shadow}`,
              transform: hovered === btn.id ? 'scale(1.12)' : 'scale(1)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {btn.icon}
          </a>
        </div>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        
        @media (min-width: 640px) {
          .floating-btn {
            width: 52px !important;
            height: 52px !important;
          }
          .floating-contact {
            right: 20px !important;
            bottom: 100px !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingContact;
