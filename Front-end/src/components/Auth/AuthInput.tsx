import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  suffix?: React.ReactNode;
}

const baseStyle: React.CSSProperties = {
  background: 'rgba(30,41,59,0.8)',
  border: '1px solid rgba(59,130,246,0.2)',
  color: '#e2e8f0',
};

const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.6)';
  e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(59,130,246,0.1)';
};
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.borderColor = 'rgba(59,130,246,0.2)';
  e.currentTarget.style.boxShadow   = 'none';
};

/**
 * Reusable dark-theme input for all auth pages.
 * Accepts an optional `suffix` slot for password-toggle buttons etc.
 */
const AuthInput: React.FC<AuthInputProps> = ({ label, suffix, className, style, ...props }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>{label}</label>
    <div className="relative">
      <input
        {...props}
        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all ${suffix ? 'pr-12' : ''} ${className ?? ''}`}
        style={{ ...baseStyle, ...style }}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {suffix}
    </div>
  </div>
);

export default AuthInput;
