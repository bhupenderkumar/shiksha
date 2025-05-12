import * as React from "react";
import { ThemeProvider as SimpleThemeProvider } from "./providers/simple-theme-provider";

// Define theme types
type Theme = "dark" | "light" | "system";

// Props interface that includes all possible props from different implementations
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

// Adapter component that uses the class-based implementation
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  // The following props are ignored but accepted to prevent errors
  attribute,
  enableSystem,
  disableTransitionOnChange,
}: ThemeProviderProps) {
  return (
    <SimpleThemeProvider defaultTheme={defaultTheme} storageKey={storageKey}>
      {children}
    </SimpleThemeProvider>
  );
}

// Re-export the useTheme hook from the simple implementation
export { useTheme } from "./providers/simple-theme-provider";
