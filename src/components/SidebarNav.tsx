import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { useAuth } from '../lib/auth';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, DollarSign, Book, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProfile } from '@/services/profileService';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  onItemClick?: () => void;
}

export function SidebarNav({ className, onItemClick, ...props }: SidebarNavProps) {
  const { profile, loading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-muted-foreground">Loading Sidebar...</span>
      </div>
    );
  }

  const items = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'Students',
      href: '/students',
      icon: <Users className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER'],
    },
    {
      title: 'Subjects',
      href: '/subjects',
      icon: <Book className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'Homework',
      href: '/homework',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'Fees',
      href: '/fees',
      icon: <DollarSign className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'Classwork',
      href: '/classwork',
      icon: <BookOpen className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
    {
      title: 'Attendance',
      href: '/attendance',
      icon: <Calendar className="w-4 h-4" />,
      roles: ['ADMIN', 'TEACHER', 'STUDENT'],
    },
  ];

  const filteredItems = items.filter((item) =>
    item.roles.includes(profile?.role || '')
  );

  const handleItemClick = (href: string) => {
    navigate(href);
    onItemClick?.();
  };

  return (
    <nav
      className={cn(
        'flex flex-col space-y-2',
        'rounded-xl bg-card shadow-sm border border-subtle',
        'p-4',
        className
      )}
      {...props}
    >
      {filteredItems.map((item) => (
        <Button
          key={item.href}
          variant={pathname === item.href ? 'default' : 'ghost'}
          className={cn(
            'w-full justify-start',
            'text-sm font-medium',
            'h-10 px-4',
            'rounded-lg transition-colors',
            pathname === item.href
              ? 'bg-primary text-primary-foreground'
              : 'text-default hover:bg-secondary hover:text-default',
            'flex items-center gap-3'
          )}
          onClick={() => handleItemClick(item.href)}
        >
          {item.icon}
          <span>{item.title}</span>
        </Button>
      ))}
    </nav>
  );
}
