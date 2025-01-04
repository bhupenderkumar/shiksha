import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Bell, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function Header() {
  const { profile, signOut } = useAuth();
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8 lg:px-12">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tight">Shiksha</span>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-transparent"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hover:bg-transparent"
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all text-muted-foreground hover:text-foreground dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all text-muted-foreground hover:text-foreground dark:rotate-0 dark:scale-100" />
          </Button>

          <div className="flex items-center gap-3 pl-2 md:pl-4 border-l">
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage src={profile?.avatar} alt={profile?.name || 'User'} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {profile?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block">
              <p className="text-sm font-medium leading-none mb-1">{profile?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
