/**
 * Shared constants across the application
 */

// Course level mappings
export const LEVEL_MAP: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

// Course level colors for different UI contexts
export const LEVEL_COLORS = {
  // For CourseCard (dark theme with rgba)
  dark: {
    beginner: {
      bg: 'rgba(16,185,129,0.12)',
      text: '#34d399',
      border: 'rgba(16,185,129,0.25)',
    },
    intermediate: {
      bg: 'rgba(59,130,246,0.12)',
      text: '#60a5fa',
      border: 'rgba(59,130,246,0.25)',
    },
    advanced: {
      bg: 'rgba(239,68,68,0.12)',
      text: '#f87171',
      border: 'rgba(239,68,68,0.25)',
    },
  },
  // For MyCoursesPage and CourseDetail (Tailwind classes)
  tailwind: {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-red-100 text-red-700',
  },
} as const;

// Auth input styles (dark theme)
export const AUTH_INPUT_STYLES = {
  base: {
    background: 'rgba(30,41,59,0.8)',
    border: '1px solid rgba(59,130,246,0.2)',
    color: '#e2e8f0',
  },
  focus: {
    borderColor: 'rgba(59,130,246,0.6)',
    boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
  },
  blur: {
    borderColor: 'rgba(59,130,246,0.2)',
    boxShadow: 'none',
  },
} as const;

// Auth card styles
export const AUTH_CARD_STYLES = {
  background: 'rgba(15,23,42,0.85)',
  border: '1px solid rgba(59,130,246,0.2)',
  boxShadow: '0 0 40px rgba(59,130,246,0.1), 0 25px 50px rgba(0,0,0,0.5)',
  backdropFilter: 'blur(12px)',
} as const;

// Auth background gradient
export const AUTH_BG_GRADIENT = 'linear-gradient(135deg, #020817 0%, #0f172a 60%, #0d1526 100%)';

// Auth grid background
export const AUTH_GRID_BG = {
  backgroundImage:
    'linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)',
  backgroundSize: '40px 40px',
} as const;
