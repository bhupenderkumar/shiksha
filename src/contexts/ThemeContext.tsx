import * as React from 'react';
import { settingsService } from '@/services/settings.service';
import { profileService } from '@/services/profileService';
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
  const { theme: baseTheme, setTheme: setBaseTheme } = useBaseTheme();
  const [user, setUser] = React.useState<any>(null);

  // Convert the base theme to legacy theme format
  const theme = baseTheme === 'dark' ? 'dark' : 'light';

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await profileService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Sync user settings with theme when user changes
  React.useEffect(() => {
    const syncThemeWithUserSettings = async () => {
      try {
        if (user?.id) {
          const settings = await settingsService.getUserSettings(user.id);
          if (settings?.theme) {
            setBaseTheme(settings.theme === 'dark' ? 'dark' : 'light');
          }
        }
      } catch (error) {
        console.error('Error syncing theme with user settings:', error);
      }
    };

    syncThemeWithUserSettings();
  }, [user, setBaseTheme]);

  // Toggle theme function for legacy components
  const toggleTheme = React.useCallback(async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setBaseTheme(newTheme);

    try {
      if (user?.id) {
        await settingsService.updateUserSettings(user.id, {
          theme: newTheme
        });
      }
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, [theme, setBaseTheme, user]);

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
