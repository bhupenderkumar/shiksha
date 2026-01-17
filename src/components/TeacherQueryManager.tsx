import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageCircle,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  contentQueryService,
  queryReplyService,
  ContentQuery,
} from '@/services/shareableLinkService';
import { useAuth } from '@/lib/auth-provider';

interface TeacherQueryManagerProps {
  shareableLinkId: string;
  contentTitle?: string;
  className?: string;
}

export const TeacherQueryManager: React.FC<TeacherQueryManagerProps> = ({
  shareableLinkId,
  contentTitle,
  className,
}) => {
  const { user } = useAuth();
  const [queries, setQueries] = useState<ContentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteQueryId, setDeleteQueryId] = useState<string | null>(null);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);

  const fetchQueries = useCallback(async () => {
    if (!shareableLinkId) return;
    
    try {
      setLoading(true);
      const data = await contentQueryService.getQueriesForLink(shareableLinkId);
      setQueries(data);
      // Auto-expand all queries that have no replies (need attention)
      const needsAttention = data.filter(q => !q.replies || q.replies.length === 0);
      setExpandedQueries(new Set(needsAttention.map(q => q.id)));
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, [shareableLinkId]);

  useEffect(() => {
    fetchQueries();
  }, [fetchQueries]);

  const toggleQueryExpanded = (queryId: string) => {
    setExpandedQueries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  };

  const handleSubmitReply = async (queryId: string) => {
    if (!replyText.trim() || !user?.id) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      const reply = await queryReplyService.createReply(
        { query_id: queryId, reply_text: replyText.trim() },
        user.id
      );

      // Update local state
      setQueries((prev) =>
        prev.map((q) => {
          if (q.id === queryId) {
            return {
              ...q,
              replies: [...(q.replies || []), reply],
            };
          }
          return q;
        })
      );

      toast.success('Reply sent successfully!');
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveQuery = async (queryId: string) => {
    if (!user?.id) return;

    try {
      await contentQueryService.resolveQuery(queryId, user.id);
      setQueries((prev) =>
        prev.map((q) => {
          if (q.id === queryId) {
            return { ...q, is_resolved: true, resolved_at: new Date().toISOString() };
          }
          return q;
        })
      );
      toast.success('Question marked as resolved');
    } catch (error) {
      console.error('Error resolving query:', error);
      toast.error('Failed to mark as resolved');
    }
  };

  const handleDeleteQuery = async () => {
    if (!deleteQueryId) return;

    try {
      await contentQueryService.deleteQuery(deleteQueryId);
      setQueries((prev) => prev.filter((q) => q.id !== deleteQueryId));
      toast.success('Question deleted');
    } catch (error) {
      console.error('Error deleting query:', error);
      toast.error('Failed to delete question');
    } finally {
      setDeleteQueryId(null);
    }
  };

  const handleDeleteReply = async () => {
    if (!deleteReplyId) return;

    try {
      await queryReplyService.deleteReply(deleteReplyId);
      setQueries((prev) =>
        prev.map((q) => ({
          ...q,
          replies: q.replies?.filter((r) => r.id !== deleteReplyId),
        }))
      );
      toast.success('Reply deleted');
    } catch (error) {
      console.error('Error deleting reply:', error);
      toast.error('Failed to delete reply');
    } finally {
      setDeleteReplyId(null);
    }
  };

  const unresolvedCount = queries.filter((q) => !q.is_resolved).length;
  const pendingRepliesCount = queries.filter((q) => !q.replies || q.replies.length === 0).length;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner />
            <span className="text-sm text-muted-foreground">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              Parent Questions
              {queries.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {queries.length}
                </Badge>
              )}
            </CardTitle>

            <div className="flex items-center gap-2">
              {pendingRepliesCount > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {pendingRepliesCount} awaiting reply
                </Badge>
              )}
              {unresolvedCount > 0 && unresolvedCount !== pendingRepliesCount && (
                <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
                  <Clock className="w-3 h-3" />
                  {unresolvedCount} unresolved
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchQueries}
                className="gap-1"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
          {contentTitle && (
            <p className="text-sm text-muted-foreground mt-1">
              Questions about: {contentTitle}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {queries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No questions yet</p>
              <p className="text-xs mt-1">Questions from parents will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queries.map((query) => (
                <QueryCard
                  key={query.id}
                  query={query}
                  isExpanded={expandedQueries.has(query.id)}
                  onToggle={() => toggleQueryExpanded(query.id)}
                  isReplying={replyingTo === query.id}
                  replyText={replyText}
                  onReplyTextChange={setReplyText}
                  onStartReply={() => {
                    setReplyingTo(query.id);
                    setReplyText('');
                  }}
                  onCancelReply={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
                  onSubmitReply={() => handleSubmitReply(query.id)}
                  onResolve={() => handleResolveQuery(query.id)}
                  onDelete={() => setDeleteQueryId(query.id)}
                  onDeleteReply={(replyId) => setDeleteReplyId(replyId)}
                  isSubmitting={isSubmitting}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Query Confirmation */}
      <AlertDialog open={!!deleteQueryId} onOpenChange={() => setDeleteQueryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the question and all its replies. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuery}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Reply Confirmation */}
      <AlertDialog open={!!deleteReplyId} onOpenChange={() => setDeleteReplyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reply?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reply. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReply}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface QueryCardProps {
  query: ContentQuery;
  isExpanded: boolean;
  onToggle: () => void;
  isReplying: boolean;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onStartReply: () => void;
  onCancelReply: () => void;
  onSubmitReply: () => void;
  onResolve: () => void;
  onDelete: () => void;
  onDeleteReply: (replyId: string) => void;
  isSubmitting: boolean;
}

const QueryCard: React.FC<QueryCardProps> = ({
  query,
  isExpanded,
  onToggle,
  isReplying,
  replyText,
  onReplyTextChange,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onResolve,
  onDelete,
  onDeleteReply,
  isSubmitting,
}) => {
  const hasReplies = query.replies && query.replies.length > 0;
  const needsAttention = !hasReplies;

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden',
        needsAttention && 'border-amber-300 bg-amber-50/30',
        query.is_resolved && 'border-green-200 bg-green-50/20'
      )}
    >
      {/* Question Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onToggle}>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="font-medium text-sm flex items-center gap-1">
                <User className="w-4 h-4 text-muted-foreground" />
                {query.parent_name}
              </span>
              {query.parent_phone && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {query.parent_phone}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(query.created_at), { addSuffix: true })}
              </span>
            </div>

            <p className="text-sm text-foreground">{query.question_text}</p>

            <div className="flex items-center gap-2 mt-2">
              {query.is_resolved && (
                <Badge
                  variant="outline"
                  className="text-xs text-green-600 border-green-200 bg-green-50"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Resolved
                </Badge>
              )}
              {needsAttention && (
                <Badge
                  variant="outline"
                  className="text-xs text-amber-600 border-amber-200 bg-amber-50"
                >
                  <Clock className="w-3 h-3 mr-1" />
                  Awaiting Reply
                </Badge>
              )}
              {hasReplies && (
                <Badge variant="secondary" className="text-xs">
                  {query.replies!.length} {query.replies!.length === 1 ? 'reply' : 'replies'}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasReplies && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={onToggle}
              >
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onStartReply}>
                  <Send className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                {!query.is_resolved && (
                  <DropdownMenuItem onClick={onResolve}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Resolved
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Question
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-4 space-y-3 p-3 bg-muted/50 rounded-lg border">
            <Textarea
              placeholder="Type your reply..."
              value={replyText}
              onChange={(e) => onReplyTextChange(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelReply}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSubmitReply}
                disabled={isSubmitting || !replyText.trim()}
                className="gap-1"
              >
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies Section */}
      {hasReplies && isExpanded && (
        <div className="border-t bg-background">
          <div className="p-4 space-y-3">
            {query.replies!.map((reply) => (
              <div
                key={reply.id}
                className="pl-4 border-l-2 border-indigo-200 group relative"
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200"
                    >
                      Teacher
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(reply.replied_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                    onClick={() => onDeleteReply(reply.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm text-foreground">{reply.reply_text}</p>
              </div>
            ))}
          </div>

          {/* Quick Reply Button */}
          {!isReplying && (
            <div className="border-t px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartReply}
                className="gap-1 text-muted-foreground hover:text-foreground"
              >
                <Send className="w-4 h-4" />
                Add another reply
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Quick Reply for unanswered */}
      {!hasReplies && !isReplying && (
        <div className="border-t px-4 py-2 bg-amber-50/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={onStartReply}
            className="gap-1 text-amber-700 hover:text-amber-900 hover:bg-amber-100"
          >
            <Send className="w-4 h-4" />
            Reply to this question
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeacherQueryManager;
