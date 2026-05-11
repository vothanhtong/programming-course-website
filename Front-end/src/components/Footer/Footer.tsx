import React from 'react';
import Logo from '../Navbar/Logo';

const footerLinks = {
  'Khóa học': ['Lập trình Web', 'Mobile App', 'Data Science', 'DevOps', 'AI & Machine Learning'],
  'Hỗ trợ':  ['Trung tâm hỗ trợ', 'Chính sách hoàn tiền', 'Điều khoản sử dụng', 'Chính sách bảo mật'],
};

const socials = [
  { 
    label: 'Facebook', 
    href: 'https://www.facebook.com/thanh.tong.378542',
    color: '#1877f2',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
  },
  { 
    label: 'YouTube', 
    href: 'https://youtube.com',
    color: '#ff0000',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  { 
    label: 'TikTok', 
    href: 'https://tiktok.com',
    color: '#000000',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
  },
  { 
    label: 'LinkedIn', 
    href: 'https://linkedin.com',
    color: '#0a66c2',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
];

const Footer: React.FC = () => (
  <footer style={{ background: '#020817', borderTop: '1px solid rgba(59,130,246,0.15)' }}>
    {/* Top glow line */}
    <div className="glow-line opacity-60" />

    <div className="container pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12"
        style={{ borderBottom: '1px solid rgba(59,130,246,0.1)' }}>

        {/* Brand — chiếm 2 cột trên desktop */}
        <div className="lg:col-span-2">
          <Logo variant="light" size="sm" />
          <p className="text-sm leading-relaxed mt-4 mb-6" style={{ color: '#475569' }}>
            Nền tảng đào tạo lập trình online uy tín tại Việt Nam.
            Học dễ hiểu – Ứng dụng thực tế.
          </p>
          <div className="flex gap-2.5">
            {socials.map((s) => (
              <a 
                key={s.label} 
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-lg flex items-center justify-center no-underline transition-all duration-200"
                style={{ background: 'rgba(59,130,246,0.08)', color: '#64748b', border: '1px solid rgba(59,130,246,0.15)' }}
                onMouseEnter={e => { 
                  (e.currentTarget as HTMLElement).style.background = `${s.color}20`; 
                  (e.currentTarget as HTMLElement).style.color = s.color; 
                  (e.currentTarget as HTMLElement).style.borderColor = `${s.color}40`;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => { 
                  (e.currentTarget as HTMLElement).style.background = 'rgba(59,130,246,0.08)'; 
                  (e.currentTarget as HTMLElement).style.color = '#64748b'; 
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.15)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}>
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        {Object.entries(footerLinks).map(([title, links]) => (
          <div key={title}>
            <h4 className="text-sm font-bold mb-5" style={{ color: '#e2e8f0' }}>{title}</h4>
            <ul className="list-none flex flex-col gap-2.5">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm no-underline transition-colors duration-200"
                    style={{ color: '#475569' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#60a5fa'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569'; }}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="py-6 flex flex-col items-center gap-2 text-center"
        style={{ color: '#475569' }}>
        <p className="text-sm" style={{ color: '#475569' }}>
          © 2025 <span style={{ color: '#60a5fa', fontWeight: 600 }}>Khóa Học Lập Trình</span>
        </p>
        <p className="text-xs" style={{ color: '#475569' }}>
          Sản phẩm thuộc quản lý của Công ty TNHH một thành viên. Tất cả quyền được bảo lưu.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
