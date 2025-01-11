import { ReactNode } from 'react';
import { NotificationsPopover } from '../ui/notifications';
import { ProfileMenu } from '../ui/profile-menu';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            {/* Logo or brand name */}
            <h1 className="text-xl font-bold">Shiksha</h1>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <NotificationsPopover />
            <ProfileMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={cn("container mx-auto px-4 py-6", className)}>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Shiksha. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
