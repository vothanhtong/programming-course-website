import React from 'react';
import { useTranslation } from 'react-i18next';

interface Feature {
  icon: string;
  title: string;
  desc: string;
  color: string;
  glow: string;
}

const Features: React.FC = () => {
  const { t } = useTranslation();
  
  const features: Feature[] = [
    { icon: '🎯', title: t('features.f1_title'), desc: t('features.f1_desc'), color: '#3b82f6', glow: 'rgba(59,130,246,0.2)' },
    { icon: '💻', title: t('features.f2_title'), desc: t('features.f2_desc'), color: '#06b6d4', glow: 'rgba(6,182,212,0.2)' },
    { icon: '👨‍🏫', title: t('features.f3_title'), desc: t('features.f3_desc'), color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
    { icon: '🥇', title: t('features.f5_title'), desc: t('features.f5_desc'), color: '#f97316', glow: 'rgba(249,115,22,0.2)' },
    { icon: '🏆', title: t('features.f4_title'), desc: t('features.f4_desc'), color: '#C9A84C', glow: 'rgba(201,168,76,0.2)' },
  ];

  return (
    <section className="section bg-slate-50 dark:bg-transparent" id="about"
      style={{ /* fallback to tailwind bg */ }}>
      <div className="absolute inset-0 dark:bg-dark-gradient pointer-events-none -z-10" />
      <div className="container relative z-10">
        {/* Glow line top */}
        <div className="glow-line mb-16 opacity-50" />

        <div className="text-center mb-14">
          <span className="tag tag-orange mb-4">✨ {t('features.title')}</span>
          <h2 className="section-title text-slate-900 dark:text-white">{t('features.title')}</h2>
        </div>

      <div className="flex flex-wrap justify-center gap-6">
        {features.map((f, i) => (
          <div key={i}
            className="w-full md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] p-8 rounded-2xl transition-all duration-300 group cursor-default bg-white border border-slate-200 dark:bg-[rgba(15,23,42,0.6)] dark:border-[rgba(59,130,246,0.12)] shadow-sm dark:shadow-none"
            style={{
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget;
              el.style.border = `1px solid ${f.color}40`;
              el.style.boxShadow = `0 8px 32px ${f.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`;
              el.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={e => {
              const el = e.currentTarget;
              el.style.border = '1px solid rgba(59,130,246,0.12)';
              el.style.boxShadow = 'none';
              el.style.transform = 'translateY(0)';
            }}>
            {/* Icon with glow */}
            <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
              style={{ background: `${f.glow}`, border: `1px solid ${f.color}30` }}>
              {f.icon}
            </div>
            <h3 className="text-base font-bold mb-2.5 text-slate-900 dark:text-[#f1f5f9]">{f.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-[#64748b]">{f.desc}</p>

            {/* Bottom accent line */}
            <div className="mt-5 h-px w-0 group-hover:w-full transition-all duration-500"
              style={{ background: `linear-gradient(90deg, ${f.color}, transparent)` }} />
          </div>
        ))}
      </div>
      </div>
    </section>
  );
};

export default Features;
