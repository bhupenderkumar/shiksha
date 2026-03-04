import * as React from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeContextType = {
  theme: "system",
  setTheme: () => null,
};

const ThemeContext = React.createContext<ThemeContextType>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
}: ThemeProviderProps) {
  // Always use light theme - dark mode removed
  const [theme] = React.useState<Theme>("light");

  // Update theme class on document element - always light
  React.useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add("light");
    // Clear any stale dark theme from localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, "light");
    }
  }, [storageKey]);

  // No-op: dark mode removed
  const setTheme = React.useCallback((_newTheme: Theme) => {
    // Always light - intentional no-op
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}