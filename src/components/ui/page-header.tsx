import { ReactNode, ElementType, createElement } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ElementType | ReactNode;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, action }: PageHeaderProps) {
  const renderIcon = () => {
    if (!Icon) return null;
    // If it's a component (function, class, or forwardRef object with $$typeof)
    if (typeof Icon === 'function' || (typeof Icon === 'object' && Icon !== null && '$$typeof' in (Icon as any))) {
      return createElement(Icon as ElementType, { className: "h-8 w-8" });
    }
    // Otherwise it's already a rendered ReactNode
    return Icon;
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