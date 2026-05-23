import { useCallback } from 'react';
import { AUTH_INPUT_STYLES } from '../utils/constants';

/**
 * Custom hook for auth input focus/blur handlers
 * Provides consistent styling for authentication form inputs
 */
export const useAuthInput = () => {
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = AUTH_INPUT_STYLES.focus.borderColor;
    e.currentTarget.style.boxShadow = AUTH_INPUT_STYLES.focus.boxShadow;
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = AUTH_INPUT_STYLES.blur.borderColor;
    e.currentTarget.style.boxShadow = AUTH_INPUT_STYLES.blur.boxShadow;
  }, []);

  return {
    inputStyle: AUTH_INPUT_STYLES.base,
    onFocus: handleFocus,
    onBlur: handleBlur,
  };
};
