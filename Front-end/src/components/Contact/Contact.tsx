import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../../api/axiosClient';

const channels = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#3b82f6">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    ),
    label: 'Email',
    value: 'vothanhtong9295@gmail.com',
    href: 'mailto:vothanhtong9295@gmail.com',
    color: '#3b82f6',
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" width="26" height="26">
        <rect width="48" height="48" rx="10" fill="#0068FF"/>
        <text x="50%" y="56%" dominantBaseline="middle" textAnchor="middle"
          fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="13" fill="white">
          Zalo
        </text>
      </svg>
    ),
    label: 'Zalo',
    value: '0917 772 494',
    href: 'https://zalo.me/0917772494',
    color: '#0068FF',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#1877f2">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
      </svg>
    ),
    label: 'Facebook',
    value: 'facebook.com/thanh.tong',
    href: 'https://www.facebook.com/thanh.tong.378542',
    color: '#1877f2',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="#8b5cf6">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      </svg>
    ),
    label: 'Địa chỉ',
    value: 'Nha Trang, Khánh Hòa',
    href: 'https://maps.google.com/?q=Nha+Trang+Khanh+Hoa',
    color: '#8b5cf6',
  },
];

const initialForm = { name: '', email: '', phone: '', message: '' };

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm]       = useState(initialForm);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosClient.post('/apis/messages', form);
      setSent(true);
      setForm(initialForm);
    } catch (err: any) {
      setError(err?.message || 'Gửi thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, [form]);

  return (
    <section
      className="section bg-slate-100 dark:bg-transparent"
      id="contact"
    >
      <div className="absolute inset-0 dark:bg-dark-gradient pointer-events-none -z-10" />
      <div className="container relative z-10">
        <div className="glow-line mb-16 opacity-40" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Info */}
          <div>
            <span className="tag tag-blue mb-4">📞 {t('contact.title')}</span>
            <h2 className="section-title text-slate-900 dark:text-white">{t('contact.title')}</h2>
            <p className="text-base leading-relaxed mb-10 text-slate-600 dark:text-slate-400">
              {t('contact.desc')}
            </p>

            <div className="flex flex-col gap-4">
              {channels.map((c) => (
                <ChannelCard key={c.label} channel={c} />
              ))}
            </div>
          </div>

          {/* Form */}
          <div
            className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm dark:bg-[rgba(15,23,42,0.7)] dark:border-[rgba(59,130,246,0.2)] dark:shadow-[0_0_40px_rgba(59,130,246,0.08)]"
            style={{
              backdropFilter: 'blur(12px)',
            }}
          >
            {sent ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-[#f1f5f9]">
                  Gửi thành công!
                </h3>
                <p className="text-slate-600 dark:text-[#64748b]">Chúng tôi sẽ liên hệ lại trong vòng 24 giờ.</p>
              </div>
            ) : (
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-[#f1f5f9]">
                  Gửi tin nhắn cho chúng tôi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Họ và tên</label>
                    <input
                      className="form-input"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Số điện thoại</label>
                    <input
                      className="form-input"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="0912 345 678"
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Tin nhắn</label>
                  <textarea
                    className="form-input resize-y"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Bạn muốn hỏi về khóa học nào?"
                    rows={5}
                    required
                  />
                </div>

                {error && (
                  <div className="px-4 py-2.5 rounded-xl text-sm" style={{
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#f87171',
                  }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
                  {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Extracted to avoid inline DOM manipulation
interface Channel {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
}

const ChannelCard: React.FC<{ channel: Channel }> = ({ channel: c }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={c.href}
      target={c.href.startsWith('http') ? '_blank' : undefined}
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 no-underline bg-slate-50 dark:bg-[rgba(15,23,42,0.5)] border border-slate-200 dark:border-[rgba(59,130,246,0.1)]"
      style={{
        background: hovered ? `${c.color}12` : undefined,
        border: hovered ? `1px solid ${c.color}45` : undefined,
        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${c.color}15`, border: `1px solid ${c.color}25` }}
      >
        {c.icon}
      </div>
      <div>
        <div className="text-xs font-medium mb-0.5 text-slate-500 dark:text-[#475569]">{c.label}</div>
        <div className="text-base font-semibold text-slate-900 dark:text-[#e2e8f0]">{c.value}</div>
      </div>
      <span className="ml-auto text-sm" style={{ color: c.color, opacity: hovered ? 1 : 0, transition: 'opacity 0.2s' }}>→</span>
    </a>
  );
};

export default Contact;
