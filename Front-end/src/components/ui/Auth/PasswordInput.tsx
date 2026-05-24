import React, { useState } from 'react';
import { useAuthInput } from '../../../hooks/useAuthInput';

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

/**
 * Reusable password input with show/hide toggle
 */
const PasswordInput: React.FC<PasswordInputProps> = ({ label, error, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const { inputStyle, onFocus, onBlur } = useAuthInput();

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#94a3b8' }}>
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          type={showPassword ? 'text' : 'password'}
          className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
          style={{
            ...inputStyle,
            ...(error && { borderColor: 'rgba(239,68,68,0.6)' }),
          }}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-base"
          style={{ color: '#475569' }}
        >
          {showPassword ? '🙈' : '👁'}
        </button>
      </div>
      {error && (
        <p className="text-xs mt-1" style={{ color: '#f87171' }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
