import { ReactNode } from 'react';
import { FrownIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string | null;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  if (!title) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
      <div className="w-20 h-20 mb-6 text-gray-400">
        {icon || <FrownIcon className="w-full h-full" />}
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-3">
        {title}
      </h3>
      {description && (
        <p className="text-gray-600 mb-6 max-w-md leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2 animate-bounce">
          {action}
        </div>
      )}
    </div>
  );
}