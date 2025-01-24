import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/theme-provider";
import { PWAPrompt } from "@/components/ui/pwa-prompt";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <PWAPrompt />
      <Toaster position="bottom-right" />
    </ThemeProvider>
  );
}
