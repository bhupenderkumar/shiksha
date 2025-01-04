import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  // ...existing props...
}

export function SidebarNav({ className, ...props }: SidebarNavProps) {
  const { profile } = useAuth();
  const pathname = usePathname();
  const isAdmin = profile?.role === 'admin';

  const defaultItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      title: 'Homework',
      href: '/homework',
      icon: '📚'
    }
  ];

  const adminItems = [
    {
      title: 'Students',
      href: '/students',
      icon: '👥'
    }
  ];

  const items = isAdmin ? [...defaultItems, ...adminItems] : defaultItems;

  return (
    <nav
      className={cn(
        'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className="justify-start w-full"
          asChild
        >
          <Link href={item.href}>
            <span className="mr-2">{item.icon}</span>
            {item.title}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
