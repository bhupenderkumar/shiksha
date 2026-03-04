import React from 'react';
import { cn } from '@/lib/utils';
import { Share2, GraduationCap, BookOpen, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';

export type ContentColorScheme = 'homework' | 'classwork';

interface PublicShareLayoutProps {
  children: React.ReactNode;
  contentType: ContentColorScheme;
  title?: string;
  subtitle?: string;
  shareUrl?: string;
  viewCount?: number;
}

const colorSchemes = {
  homework: {
    headerGradient: 'from-violet-500 via-purple-500 to-indigo-600',
    iconBg: 'bg-white/20',
    orbColors: ['violet', 'purple', 'indigo'] as const,
    accent: 'text-purple-600',
    bg: 'bg-gray-50',
    footerFrom: 'from-violet-100',
    footerTo: 'to-purple-100',
    footerBorder: 'border-violet-200',
    Icon: Pencil,
  },
  classwork: {
    headerGradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    iconBg: 'bg-white/20',
    orbColors: ['emerald', 'teal', 'cyan'] as const,
    accent: 'text-emerald-600',
    bg: 'bg-gray-50',
    footerFrom: 'from-emerald-100',
    footerTo: 'to-teal-100',
    footerBorder: 'border-emerald-200',
    Icon: BookOpen,
  },
};

export function PublicShareLayout({
  children,
  contentType,
  title,
  subtitle,
  shareUrl,
  viewCount,
}: PublicShareLayoutProps) {
  const colors = colorSchemes[contentType];
  const Icon = colors.Icon;

  const handleShare = async () => {
    const url = shareUrl || window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || `Shared ${contentType}`,
          text: subtitle || `Check out this ${contentType}`,
          url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen transition-colors duration-300',
        colors.bg
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-r',
          colors.headerGradient
        )}
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              'absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl',
              `bg-${colors.orbColors[0]}-400/20`
            )}
          />
          <div
            className={cn(
              'absolute top-10 right-20 w-48 h-48 rounded-full blur-2xl',
              `bg-${colors.orbColors[1]}-500/15`
            )}
          />
          <div
            className={cn(
              'absolute -bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl',
              `bg-${colors.orbColors[2]}-400/10`
            )}
          />
        </div>

        {/* Header content */}
        <div className="relative z-10 px-4 sm:px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className={cn('p-2.5 rounded-xl', colors.iconBg)}>
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Shiksha
                  </h1>
                  <p className="text-xs text-white/70">School Management System</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {viewCount !== undefined && viewCount > 0 && (
                  <span className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-sm font-medium">
                    {viewCount} view{viewCount !== 1 ? 's' : ''}
                  </span>
                )}
                <button
                  onClick={handleShare}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-200',
                    'bg-white/10 hover:bg-white/20 text-white'
                  )}
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Title section */}
            {(title || subtitle) && (
              <div className="mt-8 pb-6">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-xl', colors.iconBg)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {subtitle && (
                      <p className="text-white/70 text-sm font-medium mb-1 uppercase tracking-wider">
                        {subtitle}
                      </p>
                    )}
                    {title && (
                      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                        {title}
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className={cn(
          'mt-auto py-6 border-t',
          `bg-gradient-to-r ${colors.footerFrom} ${colors.footerTo} ${colors.footerBorder}`
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p
            className={cn(
              'text-sm',
              'text-gray-600'
            )}
          >
            Powered by{' '}
            <span
              className={cn('font-semibold', colors.accent)}
            >
              Shiksha
            </span>{' '}
            - School Management System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default PublicShareLayout;
