import * as React from 'react';
import { ThemeProvider as BaseThemeProvider, useTheme as useBaseTheme } from '@/components/theme-provider';

// Re-export the base ThemeProvider for compatibility
export const ThemeProvider = BaseThemeProvider;

// Re-export the base useTheme hook for compatibility
export const useTheme = useBaseTheme;

// Legacy theme context for components that need the old API
type LegacyTheme = 'light' | 'dark';

interface LegacyThemeContextType {
  theme: LegacyTheme;
  toggleTheme: () => void;
}

const LegacyThemeContext = React.createContext<LegacyThemeContextType | undefined>(undefined);

// Legacy ThemeProvider for backward compatibility
export function LegacyThemeProvider({ children }: { children: React.ReactNode }) {

  // Always light - dark mode removed
  const theme: LegacyTheme = 'light';

  // Toggle theme function - no-op, dark mode removed
  const toggleTheme = React.useCallback(async () => {
    // No-op: dark mode has been removed
  }, []);

  const contextValue = React.useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  return (
    <LegacyThemeContext.Provider value={contextValue}>
      {children}
    </LegacyThemeContext.Provider>
  );
}

// Legacy useTheme hook for backward compatibility
export function useLegacyTheme() {
  const context = React.useContext(LegacyThemeContext);
  if (context === undefined) {
    throw new Error('useLegacyTheme must be used within a LegacyThemeProvider');
  }
  return context;
}
