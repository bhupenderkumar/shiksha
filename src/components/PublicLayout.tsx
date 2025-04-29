'use client';

import { NetworkProvider } from '@/contexts/NetworkContext';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <NetworkProvider>
      {children}
    </NetworkProvider>
  );
}
