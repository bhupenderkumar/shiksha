import React from 'react';
import { cn } from '@/lib/utils';
import { 
  MessageCircle, 
  User, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

// Query and Reply interfaces (matching shareableLinkService types)
export interface QueryReply {
  id: string;
  query_id: string;
  reply_text: string;
  replied_by: string;
  replied_at: string;
}

export interface QueryItem {
  id: string;
  shareable_link_id: string;
  parent_name: string;
  parent_phone?: string;
  question_text: string;
  is_resolved: boolean;
  created_at: string;
  replies?: QueryReply[];
}

interface QueryListProps {
  queries: QueryItem[];
  expandedQueries?: Set<string>;
  onToggleQuery?: (queryId: string) => void;
  emptyMessage?: string;
  emptySubMessage?: string;
  theme?: 'light' | 'dark';
  className?: string;
}

/**
 * QueryList - A reusable component for displaying a list of queries with replies
 * Used by QuerySection for public view and TeacherQueryManager for admin view
 */
export function QueryList({
  queries,
  expandedQueries = new Set(),
  onToggleQuery,
  emptyMessage = 'No questions yet',
  emptySubMessage = 'Be the first to ask a question!',
  theme = 'light',
  className,
}: QueryListProps) {
  const isDark = theme === 'dark';
  
  // Sort queries by creation date (newest first)
  const sortedQueries = [...queries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (sortedQueries.length === 0) {
    return (
      <div className={cn(
        "text-center py-8",
        isDark ? "text-gray-400" : "text-muted-foreground",
        className
      )}>
        <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">{emptyMessage}</p>
        {emptySubMessage && (
          <p className="text-xs mt-1 opacity-70">{emptySubMessage}</p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {sortedQueries.map((query) => (
        <QueryItemCard
          key={query.id}
          query={query}
          isExpanded={expandedQueries.has(query.id)}
          onToggle={() => onToggleQuery?.(query.id)}
          theme={theme}
        />
      ))}
    </div>
  );
}

interface QueryItemCardProps {
  query: QueryItem;
  isExpanded: boolean;
  onToggle?: () => void;
  theme?: 'light' | 'dark';
}

function QueryItemCard({ query, isExpanded, onToggle, theme = 'light' }: QueryItemCardProps) {
  const isDark = theme === 'dark';
  const hasReplies = query.replies && query.replies.length > 0;

  return (
    <div className={cn(
      "border rounded-lg overflow-hidden",
      isDark ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white"
    )}>
      {/* Question Header */}
      <div
        className={cn(
          'p-4 transition-colors',
          hasReplies ? 'cursor-pointer' : '',
          isDark 
            ? hasReplies ? 'hover:bg-gray-700/50' : 'bg-gray-800/30'
            : hasReplies ? 'hover:bg-muted/50' : 'bg-muted/30'
        )}
        onClick={hasReplies ? onToggle : undefined}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn(
                "font-medium text-sm flex items-center gap-1",
                isDark ? "text-white" : "text-foreground"
              )}>
                <User className={cn(
                  "w-4 h-4",
                  isDark ? "text-gray-400" : "text-muted-foreground"
                )} />
                {query.parent_name}
              </span>
              <span className={cn(
                "text-xs",
                isDark ? "text-gray-500" : "text-muted-foreground"
              )}>
                {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
              </span>
              {query.is_resolved && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs",
                    isDark 
                      ? "text-green-400 border-green-500/30 bg-green-500/10" 
                      : "text-green-600 border-green-200 bg-green-50"
                  )}
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
            </div>
            <p className={cn(
              "text-sm",
              isDark ? "text-gray-200" : "text-foreground"
            )}>
              {query.question_text}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasReplies && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs",
                  isDark ? "bg-gray-700 text-gray-300" : ""
                )}
              >
                {query.replies!.length} {query.replies!.length === 1 ? 'reply' : 'replies'}
              </Badge>
            )}
            {hasReplies && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-8 w-8 p-0",
                  isDark ? "hover:bg-gray-700" : ""
                )}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {hasReplies && isExpanded && (
        <div className={cn(
          "border-t",
          isDark ? "border-gray-700 bg-gray-900/50" : "border-gray-200 bg-background"
        )}>
          <div className="p-4 space-y-3">
            {query.replies!.map((reply) => (
              <ReplyItemCard key={reply.id} reply={reply} theme={theme} />
            ))}
          </div>
        </div>
      )}

      {/* Waiting for reply indicator */}
      {!hasReplies && (
        <div className={cn(
          "border-t px-4 py-2",
          isDark 
            ? "border-gray-700 bg-amber-500/10 text-amber-400" 
            : "border-gray-200 bg-amber-50/50 text-amber-700"
        )}>
          <span className="text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Waiting for teacher's response...
          </span>
        </div>
      )}
    </div>
  );
}

interface ReplyItemCardProps {
  reply: QueryReply;
  theme?: 'light' | 'dark';
}

function ReplyItemCard({ reply, theme = 'light' }: ReplyItemCardProps) {
  const isDark = theme === 'dark';

  return (
    <div className={cn(
      "pl-4 border-l-2",
      isDark ? "border-indigo-500/50" : "border-indigo-200"
    )}>
      <div className="flex items-center gap-2 mb-1">
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs",
            isDark 
              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" 
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          )}
        >
          Teacher
        </Badge>
        <span className={cn(
          "text-xs",
          isDark ? "text-gray-500" : "text-muted-foreground"
        )}>
          {formatDistanceToNow(new Date(reply.replied_at), { addSuffix: true })}
        </span>
      </div>
      <p className={cn(
        "text-sm",
        isDark ? "text-gray-200" : "text-foreground"
      )}>
        {reply.reply_text}
      </p>
    </div>
  );
}

export default QueryList;
