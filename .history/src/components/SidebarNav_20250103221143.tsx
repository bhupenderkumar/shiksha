import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen } from 'lucide-react';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // ...existing code...
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const isTeacherOrAdmin = profile?.role === 'admin' || profile?.role === 'teacher';

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
    }
  ];

  const filteredItems = items.filter(item => 
    item.roles.includes(profile?.role || '')
  );

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 p-4 bg-gray-50/40 rounded-lg',
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className={cn(
            'justify-start w-full text-sm font-medium transition-colors',
            'hover:bg-gray-100 hover:text-gray-900',
            pathname === item.href
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600',
            'px-4 py-2 h-10'
          )}
          asChild
        >
          <Link href={item.href}>
            <span className="mr-3">{item.icon}</span>
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
