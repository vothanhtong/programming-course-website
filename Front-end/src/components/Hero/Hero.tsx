import React, { useCallback } from 'react';

// ── Static data (outside component to avoid re-creation on render) ──

const stats = [
  { value: '10,000+', label: 'Học viên' },
  { value: '50+',     label: 'Khóa học' },
  { value: '4.9★',   label: 'Đánh giá' },
  { value: '95%',     label: 'Hài lòng' },
];

const codeSnippet = `// Bắt đầu hành trình của bạn
const dream = "Lập trình viên";
const path  = "Khóa Học Lập Trình";

function learnToCode() {
  const skills = [
    "HTML/CSS", "JavaScript",
    "React",    "Node.js",
    "Python",   "AI/ML",
  ];
  return skills.map(s => master(s));
}

// 🚀 Đi xa cùng CODE!
learnToCode();`;

// Pre-compute lines + colors once (static data, no need to recompute per render)
const codeLines: { text: string; color: string }[] = codeSnippet
  .split('\n')
  .map((line) => ({ text: line, color: getLineColor(line) }));

interface BadgeConfig {
  text: string;
  pos: React.CSSProperties;
  delay: string;
  color: string;
  border: string;
  textColor: string;
}

const badges: BadgeConfig[] = [
  {
    text: '✅ Học mọi lúc, mọi nơi',
    pos: { top: '-18px', left: '-20px' },
    delay: '0s',
    color: 'rgba(16,185,129,0.15)',
    border: 'rgba(16,185,129,0.3)',
    textColor: '#34d399',
  },
  {
    text: '🎓 Chứng chỉ hoàn thành',
    pos: { bottom: '70px', left: '-30px' },
    delay: '1.5s',
    color: 'rgba(139,92,246,0.15)',
    border: 'rgba(139,92,246,0.3)',
    textColor: '#a78bfa',
  },
  {
    text: '💼 Hỗ trợ tìm việc',
    pos: { top: '38%', right: '-20px' },
    delay: '3s',
    color: 'rgba(59,130,246,0.15)',
    border: 'rgba(59,130,246,0.3)',
    textColor: '#60a5fa',
  },
];

// Reusable style objects (defined once, not recreated per render)
const gradientTextStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #06b6d4)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const statValueStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// ── Component ──

const Hero: React.FC = () => {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020817 0%, #0f172a 60%, #0d1526 100%)' }}
    >
      {/* Tech grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-[-150px] right-[-100px] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: Content ── */}
          <div>
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
              style={{
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)',
                color: '#60a5fa',
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
              🚀 Nền tảng học lập trình uy tín tại Việt Nam
            </div>

            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white mb-5">
              Học dễ hiểu,{' '}
              <span style={gradientTextStyle}>Đi xa cùng CODE</span>
            </h1>

            <p className="text-lg leading-relaxed mb-8 max-w-lg" style={{ color: '#94a3b8' }}>
              Học lập trình từ zero đến hero với các khóa học thực chiến, ứng dụng thực tế.
              Được thiết kế bởi các chuyên gia có kinh nghiệm tại các công ty công nghệ hàng đầu.
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button className="btn btn-primary btn-lg" onClick={() => scrollTo('courses')}>
                🎯 Khám phá khóa học
              </button>
              <button className="btn btn-outline-light btn-lg" onClick={() => scrollTo('about')}>
                ▶ Xem giới thiệu
              </button>
            </div>

            {/* Stats */}
            <div
              className="flex flex-wrap gap-8 pt-8"
              style={{ borderTop: '1px solid rgba(59,130,246,0.2)' }}
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-extrabold" style={statValueStyle}>
                    {s.value}
                  </div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: '#64748b' }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Code card ── */}
          <div className="hidden lg:block relative">
            {/* Main code window */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: '#0d1117',
                border: '1px solid rgba(59,130,246,0.25)',
                boxShadow: '0 0 40px rgba(59,130,246,0.15), 0 25px 50px rgba(0,0,0,0.5)',
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center gap-1.5 px-4 py-3"
                style={{ background: '#161b22', borderBottom: '1px solid rgba(59,130,246,0.15)' }}
              >
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs font-mono" style={{ color: '#4b5563' }}>
                  main.js — Khóa Học Lập Trình
                </span>
                <div className="ml-auto flex gap-1">
                  {['JS', 'TS', 'PY'].map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-0.5 rounded text-xs font-mono"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa' }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>

              {/* Code content — uses pre-computed lines */}
              <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                {codeLines.map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <span
                      className="select-none w-5 text-right flex-shrink-0"
                      style={{ color: '#2d3748' }}
                    >
                      {i + 1}
                    </span>
                    <span style={{ color: line.color }}>{line.text || '\u00A0'}</span>
                  </div>
                ))}
              </div>

              {/* Bottom status bar */}
              <div
                className="px-4 py-2 flex items-center gap-4 text-xs font-mono"
                style={{ background: '#1d4ed8', color: 'rgba(255,255,255,0.8)' }}
              >
                <span>⚡ JavaScript</span>
                <span>UTF-8</span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Running...
                </span>
              </div>
            </div>

            {/* Floating badges */}
            {badges.map((badge) => (
              <div
                key={badge.text}
                className="absolute px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 whitespace-nowrap animate-bounce"
                style={{
                  ...badge.pos,
                  background: badge.color,
                  border: `1px solid ${badge.border}`,
                  color: badge.textColor,
                  backdropFilter: 'blur(8px)',
                  animationDelay: badge.delay,
                  animationDuration: '3s',
                }}
              >
                {badge.text}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

// Syntax highlight helper — pure function, defined outside component
function getLineColor(line: string): string {
  if (line.startsWith('//')) return '#4b5563';
  if (line.includes('const ') || line.includes('function ') || line.includes('return')) return '#c792ea';
  if (line.includes('"') || line.includes("'")) return '#c3e88d';
  if (line.includes('[') || line.includes(']') || line.includes('{') || line.includes('}')) return '#89ddff';
  if (line.includes('(') || line.includes(')')) return '#82aaff';
  return '#a9b1d6';
}

export default Hero;
