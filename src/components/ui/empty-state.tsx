import { ReactNode } from 'react';
import { FrownIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-float">
      <div className="w-16 h-16 mb-4 text-primary-300">
        {icon || <FrownIcon className="w-full h-full" />}
      </div>
      <h3 className="text-xl font-display text-primary-600 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 font-handwriting mb-4 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
} 