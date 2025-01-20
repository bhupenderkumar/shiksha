'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { NetworkProvider } from '@/contexts/NetworkContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <NetworkProvider>
                {children}
             
      </NetworkProvider>
    </ThemeProvider>
  );
}
