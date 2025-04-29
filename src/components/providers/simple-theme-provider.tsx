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

// Class-based ThemeProvider to avoid hooks issues
export class ThemeProvider extends React.Component<{
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}> {
  state = {
    theme: this.props.defaultTheme || 'light',
  };

  componentDidMount() {
    // Get theme from localStorage if available
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(this.props.storageKey || 'ui-theme');
      if (savedTheme) {
        this.setState({ theme: savedTheme as Theme });
      }
    }

    // Apply theme to document
    this.applyTheme();
  }

  componentDidUpdate() {
    // Apply theme when it changes
    this.applyTheme();
  }

  applyTheme = () => {
    if (typeof window === 'undefined') return;

    const { theme } = this.state;
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Apply system theme or selected theme
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  };

  setTheme = (newTheme: Theme) => {
    this.setState({ theme: newTheme });
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.props.storageKey || 'ui-theme', newTheme);
    }
  };

  render() {
    const value = {
      theme: this.state.theme,
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
