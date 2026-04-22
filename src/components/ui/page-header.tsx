import { ReactNode, ElementType, createElement, isValidElement } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ElementType | ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    // Already a rendered JSX element like <BookOpen className="..." />
    if (isValidElement(Icon)) return Icon;
    // A component type (function, class, or forwardRef) — render it
    if (typeof Icon === 'function' || typeof Icon === 'object') {
      return createElement(Icon as ElementType, { className: "h-8 w-8" });
    }
    return null;
  };

  return (
    <div className="flex items-center justify-between mb-8 bg-card rounded-lg p-6 shadow-sm border border-border">
      <div className="flex items-center space-x-4">
        {Icon && (
          <div className="text-primary text-3xl animate-float">
            {renderIcon()}
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