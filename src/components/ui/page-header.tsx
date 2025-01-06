import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="text-primary text-3xl animate-float">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-display text-primary-600">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-500 font-handwriting mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
} 