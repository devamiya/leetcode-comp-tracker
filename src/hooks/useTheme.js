/**
 * useTheme hook — thin wrapper around Zustand theme store.
 * 
 * Maintained for backward compatibility. New code should import
 * useThemeStore directly from '../store/useThemeStore'.
 */
import useThemeStore from '../store/useThemeStore';

export function useTheme() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  return { theme, toggleTheme };
}
