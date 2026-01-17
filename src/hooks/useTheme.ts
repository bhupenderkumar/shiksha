import { useState, useEffect } from 'react';

interface UseThemeOptions {
  storageKey?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
}

export function useTheme(options: UseThemeOptions = {}) {
  const { storageKey = 'public-share-theme', defaultTheme = 'system' } = options;

  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    
    if (defaultTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    return defaultTheme === 'dark';
  });

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(storageKey, isDark ? 'dark' : 'light');
  }, [isDark, storageKey]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem(storageKey);
      if (!savedTheme) {
        setIsDark(e.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [storageKey]);

  const toggleTheme = () => setIsDark((prev) => !prev);
  const setTheme = (theme: 'light' | 'dark') => setIsDark(theme === 'dark');

  return { 
    isDark, 
    theme: isDark ? 'dark' as const : 'light' as const,
    toggleTheme, 
    setTheme 
  };
}

export default useTheme;
