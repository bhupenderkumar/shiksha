import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface InfoCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'gradient' | 'highlight';
  theme?: 'dark' | 'light';
  colorScheme?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
  className?: string;
}

const colorSchemes = {
  blue: {
    iconBg: 'bg-blue-500/20',
    iconText: 'text-blue-400',
    iconTextLight: 'text-blue-600',
  },
  emerald: {
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    iconTextLight: 'text-emerald-600',
  },
  purple: {
    iconBg: 'bg-purple-500/20',
    iconText: 'text-purple-400',
    iconTextLight: 'text-purple-600',
  },
  amber: {
    iconBg: 'bg-amber-500/20',
    iconText: 'text-amber-400',
    iconTextLight: 'text-amber-600',
  },
  rose: {
    iconBg: 'bg-rose-500/20',
    iconText: 'text-rose-400',
    iconTextLight: 'text-rose-600',
  },
};

export function InfoCard({
  icon: Icon,
  label,
  value,
  variant = 'default',
  theme = 'dark',
  colorScheme = 'blue',
  className,
}: InfoCardProps) {
  const colors = colorSchemes[colorScheme];

  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-300',
        variant === 'default' && [
          'bg-white border border-gray-200 shadow-sm hover:shadow-md',
        ],
        variant === 'gradient' && [
          'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm',
        ],
        variant === 'highlight' && [
          `bg-gradient-to-br from-${colorScheme}-50 to-${colorScheme}-100/50 border border-${colorScheme}-200`,
        ],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', colors.iconBg)}>
          <Icon
            className={cn(
              'w-5 h-5',
              colors.iconTextLight
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wider mb-1',
              'text-gray-500'
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              'text-sm font-semibold',
              'text-gray-900'
            )}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

// Status badge component
interface StatusBadgeProps {
  status: 'overdue' | 'due-today' | 'due-tomorrow' | 'upcoming' | 'completed';
  theme?: 'dark' | 'light';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    overdue: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-300',
      label: 'Overdue',
    },
    'due-today': {
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      border: 'border-amber-300',
      label: 'Due Today',
    },
    'due-tomorrow': {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-300',
      label: 'Due Tomorrow',
    },
    upcoming: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      label: 'Upcoming',
    },
    completed: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-300',
      label: 'Completed',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        config.bg,
        config.text,
        config.border
      )}
    >
      {config.label}
    </span>
  );
}

export default InfoCard;
