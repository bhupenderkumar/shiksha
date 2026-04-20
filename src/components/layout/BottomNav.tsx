import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calendar, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants/app-constants';

const tabs = [
  { icon: Home, label: 'Home', path: ROUTES.DASHBOARD },
  { icon: BookOpen, label: 'Homework', path: ROUTES.HOMEWORK },
  { icon: Calendar, label: 'Timetable', path: ROUTES.TIMETABLE },
  { icon: Bell, label: 'Notices', path: ROUTES.NOTIFICATIONS },
  { icon: Settings, label: 'Settings', path: ROUTES.SETTINGS },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors min-w-[64px] min-h-[44px] justify-center',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <div className="relative flex flex-col items-center">
                <Icon className={cn('w-5 h-5', isActive && 'text-primary')} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
