import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';
import {
  Calendar,
  Clock,
  Book,
  Users,
  FileText,
  ImageIcon,
  Paperclip,
  Download,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  GraduationCap,
  Pencil,
  BookOpen,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MobileImageViewer } from '@/components/ui/MobileImageViewer';
import { QuerySection } from '@/components/QuerySection';
import toast from 'react-hot-toast';
import { useTheme } from '@/hooks/useTheme';
import { usePublicContentShare, ContentType, AttachmentData } from '@/hooks/usePublicContentShare';
import { ContentLoadingState, ContentErrorState } from '@/components/shared/ContentStates';
import { fileService } from '@/services/fileService';
import { SCHOOL_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';

// Config for different content types
const contentConfig = {
  homework: {
    label: 'Homework',
    icon: Pencil,
    dateLabel: 'Due Date',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    badgeClass: {
      light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      dark: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    iconBg: {
      light: 'bg-indigo-600',
      dark: 'bg-indigo-600',
    },
  },
  classwork: {
    label: 'Classwork',
    icon: BookOpen,
    dateLabel: 'Date',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    badgeClass: {
      light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      dark: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    iconBg: {
      light: 'bg-emerald-600',
      dark: 'bg-emerald-600',
    },
  },
};

interface PublicContentShareProps {
  contentType: ContentType;
}

export const PublicContentShare: React.FC<PublicContentShareProps> = ({ contentType }) => {
  const { token } = useParams<{ token: string }>();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const {
    loading,
    error,
    content,
    imageAttachments,
    otherAttachments,
    shareableLink,
    queries,
    addQuery,
    refetch,
  } = usePublicContentShare(token, contentType);

  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showDescription, setShowDescription] = useState(true);
  const [showQueries, setShowQueries] = useState(true);

  const config = contentConfig[contentType];
  const ContentIcon = config.icon;

  // Set document title with rich information
  useEffect(() => {
    if (content) {
      const emoji = contentType === 'homework' ? '📚' : '📝';
      const typeLabel = contentType === 'homework' ? 'Homework' : 'Classwork';
      const dateStr = format(new Date(content.date), 'MMM d');
      const subjectName = content.subject?.name || '';
      const className = content.class ? `${content.class.name}${content.class.section}` : '';
      
      // Format: 📚 Math Homework | Class 5A | Due Jan 18 | School Name
      const titleParts = [
        `${emoji} ${subjectName ? subjectName + ' ' : ''}${typeLabel}`,
        className ? `Class ${className}` : '',
        contentType === 'homework' ? `Due ${dateStr}` : dateStr,
        SCHOOL_INFO.name,
      ].filter(Boolean);
      
      document.title = titleParts.join(' | ');
    } else {
      document.title = `${contentType === 'homework' ? '📚 Homework' : '📝 Classwork'} | ${SCHOOL_INFO.name}`;
    }
  }, [content, contentType]);

  // Apply theme to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const getDueStatus = useCallback(() => {
    if (!content?.date) return null;
    const date = new Date(content.date);
    
    if (contentType === 'classwork') {
      // For classwork, just show the date
      return null;
    }
    
    if (isPast(date) && !isToday(date)) {
      return { label: 'Overdue', variant: 'destructive' as const, icon: AlertCircle };
    }
    if (isToday(date)) {
      return { label: 'Due Today', variant: 'warning' as const, icon: AlertCircle };
    }
    if (isTomorrow(date)) {
      return { label: 'Due Tomorrow', variant: 'secondary' as const, icon: Clock };
    }
    return { 
      label: `Due ${formatDistanceToNow(date, { addSuffix: true })}`, 
      variant: 'outline' as const, 
      icon: Calendar 
    };
  }, [content?.date, contentType]);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleDownload = async (attachment: AttachmentData) => {
    try {
      await fileService.downloadFile(attachment.filePath, attachment.fileName);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: content?.title || config.label,
        text: `Check out this ${contentType}: ${content?.title}`,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const dueStatus = getDueStatus();

  if (loading) {
    return <ContentLoadingState contentType={contentType} />;
  }

  if (error || !content || !shareableLink) {
    return (
      <ContentErrorState
        contentType={contentType}
        error={error || `This ${contentType} link is not available or has expired.`}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark 
        ? "bg-gray-950" 
        : "bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
    )}>
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300",
        isDark 
          ? "bg-gray-900/80 border-gray-800" 
          : "bg-white/80 border-gray-200"
      )}>
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                isDark ? config.iconBg.dark : config.iconBg.light
              )}>
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className={cn(
                  "font-bold text-sm sm:text-base truncate",
                  isDark ? "text-white" : "text-gray-900"
                )}>{SCHOOL_INFO.name}</h1>
                <p className={cn(
                  "text-xs truncate hidden sm:block",
                  isDark ? "text-gray-400" : "text-gray-500"
                )}>{SCHOOL_INFO.address}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
                className={cn(
                  "w-9 h-9 rounded-lg",
                  isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <Share2Icon className="w-4 h-4" />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Card */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-xl",
          isDark ? "bg-gray-900" : "bg-white"
        )}>
          <div className={cn("h-1.5 bg-gradient-to-r", config.gradient)} />
          
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-3 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={cn(
                    "font-medium",
                    isDark ? config.badgeClass.dark : config.badgeClass.light
                  )}>
                    <ContentIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  {dueStatus && (
                    <Badge variant={dueStatus.variant} className="font-medium">
                      <dueStatus.icon className="w-3 h-3 mr-1" />
                      {dueStatus.label}
                    </Badge>
                  )}
                </div>
                <CardTitle className={cn(
                  "text-2xl sm:text-3xl font-bold leading-tight",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {content.title}
                </CardTitle>
              </div>
              
              {shareableLink.view_count > 0 && (
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs",
                  isDark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500"
                )}>
                  <Eye className="w-3.5 h-3.5" />
                  {shareableLink.view_count} views
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <InfoCard
                icon={Calendar}
                label={config.dateLabel}
                value={format(new Date(content.date), 'MMM d, yyyy')}
                subValue={format(new Date(content.date), 'EEEE')}
                isDark={isDark}
                accent="indigo"
              />
              {content.class && (
                <InfoCard
                  icon={Users}
                  label="Class"
                  value={`${content.class.name} ${content.class.section}`}
                  isDark={isDark}
                  accent="purple"
                />
              )}
              {content.subject && (
                <InfoCard
                  icon={Book}
                  label="Subject"
                  value={content.subject.name}
                  subValue={content.subject.code}
                  isDark={isDark}
                  accent="pink"
                />
              )}
              {content.createdAt && (
                <InfoCard
                  icon={Clock}
                  label="Posted"
                  value={format(new Date(content.createdAt), 'MMM d')}
                  subValue={formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                  isDark={isDark}
                  accent="cyan"
                />
              )}
            </div>

            {/* Description Section */}
            {content.description && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowDescription(!showDescription)}
                  className={cn(
                    "flex items-center gap-2 w-full text-left group",
                    isDark ? "text-gray-300" : "text-gray-700"
                  )}
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-sm">
                    {contentType === 'homework' ? 'Instructions' : 'Description'}
                  </span>
                  {showDescription ? (
                    <ChevronUp className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-auto opacity-50 group-hover:opacity-100" />
                  )}
                </button>
                {showDescription && (
                  <div className={cn(
                    "rounded-xl p-4 text-sm sm:text-base leading-relaxed whitespace-pre-wrap",
                    isDark ? "bg-gray-800/50 text-gray-300" : "bg-gray-50 text-gray-700"
                  )}>
                    {content.description}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image Attachments */}
        {imageAttachments.length > 0 && (
          <Card className={cn(
            "border-0 shadow-xl overflow-hidden",
            isDark ? "bg-gray-900" : "bg-white"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-lg flex items-center gap-2",
                isDark ? "text-white" : "text-gray-900"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-pink-500/20" : "bg-pink-100"
                )}>
                  <ImageIcon className={cn("w-4 h-4", isDark ? "text-pink-400" : "text-pink-600")} />
                </div>
                <span>Images</span>
                <Badge variant="secondary" className="ml-auto">{imageAttachments.length}</Badge>
              </CardTitle>
              <p className={cn(
                "text-xs",
                isDark ? "text-gray-500" : "text-gray-400"
              )}>Tap to view full screen • Pinch to zoom</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {imageAttachments.map((attachment, index) => (
                  <button
                    key={attachment.id}
                    onClick={() => handleImageClick(index)}
                    className={cn(
                      "relative aspect-square rounded-xl overflow-hidden group transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2",
                      isDark 
                        ? "bg-gray-800 hover:ring-2 hover:ring-indigo-400" 
                        : "bg-gray-100 hover:ring-2 hover:ring-indigo-300"
                    )}
                  >
                    {attachment.url ? (
                      <img
                        src={attachment.url}
                        alt={attachment.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className={cn("w-8 h-8", isDark ? "text-gray-600" : "text-gray-300")} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                      <span className="text-white text-xs truncate block">{attachment.fileName}</span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Other Attachments */}
        {otherAttachments.length > 0 && (
          <Card className={cn(
            "border-0 shadow-xl",
            isDark ? "bg-gray-900" : "bg-white"
          )}>
            <CardHeader className="pb-3">
              <CardTitle className={cn(
                "text-lg flex items-center gap-2",
                isDark ? "text-white" : "text-gray-900"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  isDark ? "bg-cyan-500/20" : "bg-cyan-100"
                )}>
                  <Paperclip className={cn("w-4 h-4", isDark ? "text-cyan-400" : "text-cyan-600")} />
                </div>
                <span>Attachments</span>
                <Badge variant="secondary" className="ml-auto">{otherAttachments.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {otherAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl transition-colors",
                      isDark 
                        ? "bg-gray-800/50 hover:bg-gray-800" 
                        : "bg-gray-50 hover:bg-gray-100"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                        isDark ? "bg-indigo-500/20" : "bg-indigo-100"
                      )}>
                        <FileText className={cn("w-5 h-5", isDark ? "text-indigo-400" : "text-indigo-600")} />
                      </div>
                      <div className="min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          isDark ? "text-white" : "text-gray-900"
                        )}>{attachment.fileName}</p>
                        <p className={cn(
                          "text-xs uppercase",
                          isDark ? "text-gray-500" : "text-gray-400"
                        )}>
                          {attachment.fileType || attachment.fileName.split('.').pop()}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isDark ? "secondary" : "outline"}
                      onClick={() => handleDownload(attachment)}
                      className="flex-shrink-0 gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Download</span>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Questions Section */}
        <Card className={cn(
          "border-0 shadow-xl",
          isDark ? "bg-gray-900" : "bg-white"
        )}>
          <CardHeader className="pb-3">
            <button
              onClick={() => setShowQueries(!showQueries)}
              className="flex items-center gap-2 w-full text-left"
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isDark ? "bg-amber-500/20" : "bg-amber-100"
              )}>
                <MessageSquare className={cn("w-4 h-4", isDark ? "text-amber-400" : "text-amber-600")} />
              </div>
              <CardTitle className={cn(
                "text-lg",
                isDark ? "text-white" : "text-gray-900"
              )}>Questions & Answers</CardTitle>
              {queries.length > 0 && (
                <Badge variant="secondary" className="ml-2">{queries.length}</Badge>
              )}
              {showQueries ? (
                <ChevronUp className={cn("w-4 h-4 ml-auto", isDark ? "text-gray-500" : "text-gray-400")} />
              ) : (
                <ChevronDown className={cn("w-4 h-4 ml-auto", isDark ? "text-gray-500" : "text-gray-400")} />
              )}
            </button>
          </CardHeader>
          {showQueries && (
            <CardContent>
              <QuerySection
                shareableLinkId={shareableLink.id}
                queries={queries}
                onQuerySubmitted={addQuery}
                isPublicView={true}
                className=""
              />
            </CardContent>
          )}
        </Card>

        {/* Footer */}
        <footer className={cn(
          "text-center py-8 space-y-2",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>
          <div className="flex items-center justify-center gap-2">
            <GraduationCap className="w-5 h-5" />
            <span className="font-medium">{SCHOOL_INFO.name}</span>
          </div>
          <p className="text-xs">{SCHOOL_INFO.phone}</p>
          <p className="text-xs opacity-60">Shared {contentType} • Powered by Shiksha</p>
        </footer>
      </main>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <MobileImageViewer
          images={imageAttachments.map((att) => ({
            url: att.url || '',
            alt: att.fileName,
            fileName: att.fileName,
          }))}
          initialIndex={selectedImageIndex}
          onClose={() => setImageViewerOpen(false)}
          onDownload={(index) => handleDownload(imageAttachments[index])}
        />
      )}
    </div>
  );
};

// Helper components
import { Share2 as Share2Icon, Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "w-9 h-9 rounded-lg",
        isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"
      )}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
};

// InfoCard component (same as before but kept local for simplicity)
interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue?: string;
  isDark: boolean;
  accent: 'indigo' | 'purple' | 'pink' | 'cyan';
}

const accentColors = {
  indigo: {
    light: 'bg-indigo-100 text-indigo-600',
    dark: 'bg-indigo-500/20 text-indigo-400',
  },
  purple: {
    light: 'bg-purple-100 text-purple-600',
    dark: 'bg-purple-500/20 text-purple-400',
  },
  pink: {
    light: 'bg-pink-100 text-pink-600',
    dark: 'bg-pink-500/20 text-pink-400',
  },
  cyan: {
    light: 'bg-cyan-100 text-cyan-600',
    dark: 'bg-cyan-500/20 text-cyan-400',
  },
};

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, label, value, subValue, isDark, accent }) => {
  const colors = accentColors[accent];
  
  return (
    <div className={cn(
      "rounded-xl p-3 sm:p-4 transition-colors",
      isDark ? "bg-gray-800/50" : "bg-gray-50"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn(
          "w-6 h-6 rounded-lg flex items-center justify-center",
          isDark ? colors.dark : colors.light
        )}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className={cn(
          "text-xs font-medium",
          isDark ? "text-gray-400" : "text-gray-500"
        )}>{label}</span>
      </div>
      <p className={cn(
        "font-semibold text-sm sm:text-base truncate",
        isDark ? "text-white" : "text-gray-900"
      )}>{value}</p>
      {subValue && (
        <p className={cn(
          "text-xs truncate mt-0.5",
          isDark ? "text-gray-500" : "text-gray-400"
        )}>{subValue}</p>
      )}
    </div>
  );
};

export default PublicContentShare;
