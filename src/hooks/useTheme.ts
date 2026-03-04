import { useEffect } from 'react';

interface UseThemeOptions {
  storageKey?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
}

/**
 * Theme hook - dark mode has been removed.
 * Always returns light theme. Kept for API compatibility.
 */
export function useTheme(_options: UseThemeOptions = {}) {
  // Ensure dark class is never on the document
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  return { 
    isDark: false as const, 
    theme: 'light' as const,
    toggleTheme: () => {},
    setTheme: (_theme: 'light' | 'dark') => {} 
  };
}

export default useTheme;
