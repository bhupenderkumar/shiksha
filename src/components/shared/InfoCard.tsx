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
  const isDark = theme === 'dark';

  return (
    <div
      className={cn(
        'rounded-xl p-4 transition-all duration-300',
        variant === 'default' && [
          isDark
            ? 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/70'
            : 'bg-white border border-gray-200 shadow-sm hover:shadow-md',
        ],
        variant === 'gradient' && [
          isDark
            ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50'
            : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm',
        ],
        variant === 'highlight' && [
          isDark
            ? `bg-gradient-to-br from-${colorScheme}-500/10 to-${colorScheme}-600/5 border border-${colorScheme}-500/20`
            : `bg-gradient-to-br from-${colorScheme}-50 to-${colorScheme}-100/50 border border-${colorScheme}-200`,
        ],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn('p-2.5 rounded-lg flex-shrink-0', colors.iconBg)}>
          <Icon
            className={cn(
              'w-5 h-5',
              isDark ? colors.iconText : colors.iconTextLight
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs font-medium uppercase tracking-wider mb-1',
              isDark ? 'text-slate-400' : 'text-gray-500'
            )}
          >
            {label}
          </p>
          <div
            className={cn(
              'text-sm font-semibold',
              isDark ? 'text-white' : 'text-gray-900'
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

export function StatusBadge({ status, theme = 'dark' }: StatusBadgeProps) {
  const isDark = theme === 'dark';

  const statusConfig = {
    overdue: {
      bg: isDark ? 'bg-red-500/20' : 'bg-red-100',
      text: isDark ? 'text-red-400' : 'text-red-700',
      border: isDark ? 'border-red-500/30' : 'border-red-300',
      label: 'Overdue',
    },
    'due-today': {
      bg: isDark ? 'bg-amber-500/20' : 'bg-amber-100',
      text: isDark ? 'text-amber-400' : 'text-amber-700',
      border: isDark ? 'border-amber-500/30' : 'border-amber-300',
      label: 'Due Today',
    },
    'due-tomorrow': {
      bg: isDark ? 'bg-blue-500/20' : 'bg-blue-100',
      text: isDark ? 'text-blue-400' : 'text-blue-700',
      border: isDark ? 'border-blue-500/30' : 'border-blue-300',
      label: 'Due Tomorrow',
    },
    upcoming: {
      bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100',
      text: isDark ? 'text-emerald-400' : 'text-emerald-700',
      border: isDark ? 'border-emerald-500/30' : 'border-emerald-300',
      label: 'Upcoming',
    },
    completed: {
      bg: isDark ? 'bg-green-500/20' : 'bg-green-100',
      text: isDark ? 'text-green-400' : 'text-green-700',
      border: isDark ? 'border-green-500/30' : 'border-green-300',
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
