import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="text-primary text-3xl animate-float">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl font-display text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-muted-foreground font-handwriting mt-1">
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