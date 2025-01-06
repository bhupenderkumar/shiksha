import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import {
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { ThemeToggleButton } from './ThemeToggleButton';
import { SidebarNav } from './SidebarNav';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-subtle">
      <div className="flex">
        <aside className="hidden lg:block w-72 min-h-screen p-6">
          <SidebarNav />
        </aside>
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <header className="bg-card shadow-sm p-4 flex justify-between items-center rounded-lg mb-6 border border-subtle">
              <h1 className="text-xl font-semibold text-default">First Step Public School</h1>
              <div className="flex items-center space-x-4">
                <ThemeToggleButton />
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none group">
                    <div className="flex items-center space-x-2 hover:bg-accent rounded-full p-1 transition-colors duration-200">
                      <Avatar className="h-8 w-8 transition-transform group-hover:ring-2 ring-primary">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {profile?.full_name ? getInitials(profile.full_name) : '??'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-hover:text-foreground group-data-[state=open]:rotate-180" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{profile?.full_name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => navigate('/settings')}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>
            <div className="bg-card shadow-sm rounded-lg p-6 border border-subtle">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
