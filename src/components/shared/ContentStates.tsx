import { cn } from '@/lib/utils';
import { Loader2, AlertTriangle, RefreshCw, BookOpen, Pencil } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface LoadingStateProps {
  contentType: 'homework' | 'classwork';
  message?: string;
}

export function ContentLoadingState({ contentType, message }: LoadingStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Icon = contentType === 'homework' ? Pencil : BookOpen;
  const colorClass = contentType === 'homework' ? 'text-purple-500' : 'text-emerald-500';
  const bgGradient =
    contentType === 'homework'
      ? 'from-violet-600 via-purple-600 to-indigo-700'
      : 'from-emerald-600 via-teal-600 to-cyan-700';

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      )}
    >
      {/* Mini header */}
      <div className={cn('bg-gradient-to-r py-4', bgGradient)}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Shiksha</span>
          </div>
        </div>
      </div>

      {/* Loading content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-6">
            <div
              className={cn(
                'absolute inset-0 rounded-full blur-xl opacity-30',
                colorClass
              )}
            />
            <Loader2
              className={cn('w-16 h-16 animate-spin mx-auto relative', colorClass)}
            />
          </div>
          <h2
            className={cn(
              'text-xl font-semibold mb-2',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            {message || `Loading ${contentType}...`}
          </h2>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-gray-500')}>
            Please wait while we fetch the content
          </p>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  contentType: 'homework' | 'classwork';
  error: string;
  onRetry?: () => void;
}

export function ContentErrorState({ contentType, error, onRetry }: ErrorStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const Icon = contentType === 'homework' ? Pencil : BookOpen;
  const bgGradient =
    contentType === 'homework'
      ? 'from-violet-600 via-purple-600 to-indigo-700'
      : 'from-emerald-600 via-teal-600 to-cyan-700';
  const buttonColor =
    contentType === 'homework'
      ? 'bg-purple-600 hover:bg-purple-700'
      : 'bg-emerald-600 hover:bg-emerald-700';

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        isDark ? 'bg-slate-900' : 'bg-gray-50'
      )}
    >
      {/* Mini header */}
      <div className={cn('bg-gradient-to-r py-4', bgGradient)}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Shiksha</span>
          </div>
        </div>
      </div>

      {/* Error content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className={cn(
            'max-w-md w-full rounded-2xl p-8 text-center',
            isDark
              ? 'bg-slate-800/50 border border-slate-700/50'
              : 'bg-white border border-gray-200 shadow-lg'
          )}
        >
          <div
            className={cn(
              'w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6',
              isDark ? 'bg-red-500/20' : 'bg-red-100'
            )}
          >
            <AlertTriangle
              className={cn('w-8 h-8', isDark ? 'text-red-400' : 'text-red-600')}
            />
          </div>
          <h2
            className={cn(
              'text-xl font-bold mb-3',
              isDark ? 'text-white' : 'text-gray-900'
            )}
          >
            Unable to Load Content
          </h2>
          <p
            className={cn(
              'text-sm mb-6',
              isDark ? 'text-slate-400' : 'text-gray-600'
            )}
          >
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-white transition-colors',
                buttonColor
              )}
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default { ContentLoadingState, ContentErrorState };
