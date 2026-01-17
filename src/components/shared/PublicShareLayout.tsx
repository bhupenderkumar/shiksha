import React from 'react';
import { cn } from '@/lib/utils';
import { Moon, Sun, Share2, GraduationCap, BookOpen, Pencil } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
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
    // Gradient backgrounds
    headerGradientDark: 'from-violet-600 via-purple-600 to-indigo-700',
    headerGradientLight: 'from-violet-500 via-purple-500 to-indigo-600',
    // Icon colors
    iconBgDark: 'bg-white/20',
    iconBgLight: 'bg-white/30',
    // Decorative orbs
    orbColors: ['violet', 'purple', 'indigo'] as const,
    // Text accents
    accentDark: 'text-purple-400',
    accentLight: 'text-purple-600',
    // Background
    bgDark: 'bg-slate-900',
    bgLight: 'bg-gray-50',
    // Footer gradient
    footerFromDark: 'from-violet-500/10',
    footerToDark: 'to-purple-500/10',
    footerBorderDark: 'border-violet-500/20',
    footerFromLight: 'from-violet-100',
    footerToLight: 'to-purple-100',
    footerBorderLight: 'border-violet-200',
    // Icon
    Icon: Pencil,
  },
  classwork: {
    headerGradientDark: 'from-emerald-600 via-teal-600 to-cyan-700',
    headerGradientLight: 'from-emerald-500 via-teal-500 to-cyan-600',
    iconBgDark: 'bg-white/20',
    iconBgLight: 'bg-white/30',
    orbColors: ['emerald', 'teal', 'cyan'] as const,
    accentDark: 'text-emerald-400',
    accentLight: 'text-emerald-600',
    bgDark: 'bg-slate-900',
    bgLight: 'bg-gray-50',
    footerFromDark: 'from-emerald-500/10',
    footerToDark: 'to-teal-500/10',
    footerBorderDark: 'border-emerald-500/20',
    footerFromLight: 'from-emerald-100',
    footerToLight: 'to-teal-100',
    footerBorderLight: 'border-emerald-200',
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
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
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
        isDark ? colors.bgDark : colors.bgLight
      )}
    >
      {/* Header */}
      <header
        className={cn(
          'relative overflow-hidden',
          'bg-gradient-to-r',
          isDark ? colors.headerGradientDark : colors.headerGradientLight
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
                <div className={cn('p-2.5 rounded-xl', colors.iconBgDark)}>
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
                  onClick={toggleTheme}
                  className={cn(
                    'p-2.5 rounded-xl transition-all duration-200',
                    'bg-white/10 hover:bg-white/20 text-white'
                  )}
                  aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
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
                  <div className={cn('p-3 rounded-xl', colors.iconBgDark)}>
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
          isDark
            ? `bg-gradient-to-r ${colors.footerFromDark} ${colors.footerToDark} ${colors.footerBorderDark}`
            : `bg-gradient-to-r ${colors.footerFromLight} ${colors.footerToLight} ${colors.footerBorderLight}`
        )}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <p
            className={cn(
              'text-sm',
              isDark ? 'text-slate-400' : 'text-gray-600'
            )}
          >
            Powered by{' '}
            <span
              className={cn('font-semibold', isDark ? colors.accentDark : colors.accentLight)}
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
