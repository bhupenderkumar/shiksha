import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, DollarSign } from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // ...existing code...
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const isTeacherOrAdmin = profile?.role === 'admin' || profile?.role === 'teacher';

  console.log('Profile:', profile); // Debug log
  const items = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['admin', 'teacher', 'student']
    },
    {
      title: 'Students',
      href: '/students',
      icon: <Users className="w-4 h-4" />,
      roles: ['admin', 'teacher']
    },
    {
      title: 'Homework',
      href: '/homework',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['admin', 'teacher', 'student']
    },
    {
      title: 'Fees',
      href: '/fees',
      icon: <DollarSign className="w-4 h-4" />,
      roles: ['admin', 'teacher', 'student']
    }
  ];

  const filteredItems = items.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  console.log('Filtered Items:', filteredItems); // Debug log

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        'p-6 rounded-xl bg-background/60 backdrop-blur-lg border border-border/40',
        'max-h-[calc(100vh-6rem)] overflow-y-auto',
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className={cn(
            'justify-start w-full text-sm font-medium transition-all',
            'hover:bg-primary/10 hover:text-primary',
            pathname === item.href
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground',
            'px-4 py-2 h-11 rounded-lg',
            'flex items-center gap-3'
          )}
          asChild
        >
          <Link href={item.href}>
            {item.icon}
            <span className="hidden md:inline-block">{item.title}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
}
