import { ReactNode, useState } from 'react';
import { Logo } from '../logo';
import { Navigation } from './navigation';
import { UserMenu } from './user-menu';
import { SidebarNav } from '../SidebarNav';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
}

export function PageLayout({ children, title }: PageLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <button 
        onClick={toggleSidebar} 
        className="p-2" // Show on all screen sizes
      >
        {isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      </button>
      <SidebarNav className={`transition-transform duration-300 ${isSidebarCollapsed ? 'transform -translate-x-full' : ''}`} />
      <div className="flex-1">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Logo className="mr-4" />
            <Navigation className="mx-6" />
            <div className="ml-auto flex items-center space-x-4">
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="container py-6">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight mb-6">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
