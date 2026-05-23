/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#F5D485',
          dark:    '#A07830',
        },
        // Tech dark palette
        navy: {
          950: '#020817',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        neon: {
          blue:   '#3b82f6',
          purple: '#8b5cf6',
          cyan:   '#06b6d4',
          green:  '#10b981',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gold-gradient':  'linear-gradient(135deg, #F5D485, #C9A84C, #A07830)',
        'dark-gradient':  'linear-gradient(135deg, #020817 0%, #0f172a 50%, #0d1526 100%)',
        'blue-gradient':  'linear-gradient(135deg, #1e3a5f, #1d4ed8)',
        'tech-grid':      'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-40': '40px 40px',
      },
      animation: {
        'float':       'float 6s ease-in-out infinite',
        'pulse-slow':  'pulse 4s cubic-bezier(0.4,0,0.6,1) infinite',
        'glow':        'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        glow: {
          from: { boxShadow: '0 0 10px rgba(59,130,246,0.3)' },
          to:   { boxShadow: '0 0 25px rgba(59,130,246,0.7), 0 0 50px rgba(59,130,246,0.3)' },
        },
      },
      boxShadow: {
        'neon-blue':   '0 0 20px rgba(59,130,246,0.4), 0 0 60px rgba(59,130,246,0.15)',
        'neon-purple': '0 0 20px rgba(139,92,246,0.4), 0 0 60px rgba(139,92,246,0.15)',
        'card-dark':   '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
};
