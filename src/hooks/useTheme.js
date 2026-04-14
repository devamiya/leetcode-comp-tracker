import { useState, useEffect } from 'react';

const THEME_STORAGE_KEY = 'theme';

export function useTheme() {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem(THEME_STORAGE_KEY) || 
           (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const handleSystemThemeChange = event => {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setThemeState(event.matches ? 'light' : 'dark');
      }
    };
    mq.addEventListener('change', handleSystemThemeChange);
    return () => mq.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, toggleTheme };
}
