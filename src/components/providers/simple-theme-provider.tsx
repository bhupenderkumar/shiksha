import * as React from 'react';

// Define theme types
type Theme = 'light' | 'dark' | 'system';

// Define theme context type
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// Create context with default values
const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
});

/**
 * ThemeProvider - dark mode removed. Always provides light theme.
 */
export class ThemeProvider extends React.Component<{
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}> {
  state = {
    theme: 'light' as Theme,
  };

  componentDidMount() {
    // Always ensure light mode
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }

  setTheme = (_newTheme: Theme) => {
    // No-op: dark mode removed
  };

  render() {
    const value = {
      theme: 'light' as Theme,
      setTheme: this.setTheme,
    };

    return (
      <ThemeContext.Provider value={value}>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

// Hook for consuming the theme context
export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
