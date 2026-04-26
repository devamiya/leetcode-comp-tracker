/**
 * Theme store (Zustand).
 * 
 * Centralized theme management — any component can read/toggle theme
 * without prop drilling. Persists to localStorage and respects system preference.
 */
import { create } from 'zustand';

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem(THEME_STORAGE_KEY) ||
    (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
}

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    set({ theme: newTheme });
  },

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ theme });
  },
}));

// Apply initial theme on load
if (typeof window !== 'undefined') {
  document.documentElement.setAttribute('data-theme', getInitialTheme());

  // Listen for system theme changes
  const mq = window.matchMedia('(prefers-color-scheme: light)');
  mq.addEventListener('change', (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      const newTheme = event.matches ? 'light' : 'dark';
      useThemeStore.getState().setTheme(newTheme);
    }
  });
}

export default useThemeStore;
