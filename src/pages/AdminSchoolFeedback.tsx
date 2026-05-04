import React, { useState, useEffect, useRef } from 'react';
import { schoolFeedbackService, SchoolFeedback } from '@/services/schoolFeedbackService';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import {
  Star,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Trash2,
  Loader2,
  MessageSquare,
  Mic,
  Phone,
  User,
  Filter,
  Reply as ReplyIcon,
  Send,
  Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/ui/page-header';

import { cn } from '@/lib/utils';

const AdminSchoolFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<SchoolFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'NEW' | 'REVIEWED' | 'REPLIED'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Per-row reply state
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [openReplyId, setOpenReplyId] = useState<string | null>(null);
  const [savingReplyId, setSavingReplyId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await schoolFeedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (error) {
      console.error('Error loading feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkReviewed = async (id: string) => {
    try {
      await schoolFeedbackService.markReviewed(id);
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: 'REVIEWED' as const } : f))
      );
      toast.success('Marked as reviewed');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await schoolFeedbackService.deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      toast.success('Feedback deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleSendReply = async (id: string) => {
    const reply = (replyDrafts[id] || '').trim();
    if (!reply) {
      toast.error('Reply is empty');
      return;
    }
    try {
      setSavingReplyId(id);
      await schoolFeedbackService.replyFeedback(id, reply);
      const repliedAt = new Date().toISOString();
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                admin_reply: reply,
                replied_at: repliedAt,
                status: 'REPLIED' as const,
              }
            : f
        )
      );
      setReplyDrafts((d) => ({ ...d, [id]: '' }));
      setOpenReplyId(null);
      toast.success('Reply sent. Parent can see it via their code.');
    } catch (e) {
      console.error(e);
      toast.error('Failed to send reply');
    } finally {
      setSavingReplyId(null);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success('Code copied');
    } catch {
      toast.error('Could not copy');
    }
  };

  const toggleAudio = (id: string, url: string) => {
    if (!audioRef.current) return;

    if (playingId === id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = url;
      audioRef.current.play();
      setPlayingId(id);
    }
  };

  const filtered =
    filter === 'all'
      ? feedbacks
      : feedbacks.filter((f) => f.status === filter);

  const newCount = feedbacks.filter((f) => f.status === 'NEW').length;

  const renderStars = (count: number | null) => {
    if (!count) return <span className="text-gray-400 text-sm">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={cn(
              'w-4 h-4',
              s <= count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Parent Feedback"
        subtitle="Voice & text feedback from parents"
        icon={MessageSquare}
      />
      <audio ref={audioRef} onEnded={() => setPlayingId(null)} className="hidden" />

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                Parent Feedback
                {newCount > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {newCount} new
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Voice & text feedback from parents
              </CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'NEW', 'REVIEWED', 'REPLIED'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {f === 'all'
                    ? 'All'
                    : f === 'NEW'
                    ? 'New'
                    : f === 'REVIEWED'
                    ? 'Reviewed'
                    : 'Replied'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No feedback found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((fb) => (
                <div
                  key={fb.id}
                  className={cn(
                    'border rounded-xl p-4 transition-colors',
                    fb.status === 'NEW'
                      ? 'bg-blue-50 border-blue-200'
                      : fb.status === 'REPLIED'
                      ? 'bg-green-50/40 border-green-200'
                      : 'bg-white border-gray-200'
                  )}
                >
                  {/* Top row: ticket + rating + status + date */}
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      {fb.ticket_code && (
                        <button
                          type="button"
                          onClick={() => handleCopyCode(fb.ticket_code!)}
                          className="inline-flex items-center gap-1 text-xs font-mono font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                          title="Copy code"
                        >
                          {fb.ticket_code}
                          <Copy className="w-3 h-3" />
                        </button>
                      )}
                      {fb.category && (
                        <Badge variant="outline" className="text-xs">
                          {fb.category}
                        </Badge>
                      )}
                      {renderStars(fb.rating)}
                      {fb.status === 'NEW' ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      ) : fb.status === 'REPLIED' ? (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
                        >
                          <ReplyIcon className="w-3 h-3 mr-1" />
                          Replied
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Reviewed
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {format(new Date(fb.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>

                  {/* Parent info */}
                  {(fb.parent_name || fb.phone) && (
                    <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                      {fb.parent_name && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {fb.parent_name}
                        </span>
                      )}
                      {fb.phone && (
                        <a
                          href={`tel:${fb.phone}`}
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {fb.phone}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Voice message */}
                  {fb.voice_url && (
                    <div className="mb-3">
                      <button
                        onClick={() => toggleAudio(fb.id, fb.voice_url!)}
                        className={cn(
                          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          playingId === fb.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        )}
                      >
                        {playingId === fb.id ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <Mic className="w-4 h-4" />
                        {playingId === fb.id ? 'Playing...' : 'Play Voice'}
                      </button>
                    </div>
                  )}

                  {/* Text message */}
                  {fb.message && (
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 mb-3 whitespace-pre-wrap">
                      {fb.message}
                    </p>
                  )}

                  {/* Existing reply (if any) */}
                  {fb.admin_reply && (
                    <div className="mb-3 rounded-lg border border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-1 text-xs font-medium text-green-700 mb-1">
                        <ReplyIcon className="w-3.5 h-3.5" />
                        Reply sent
                        {fb.replied_at && (
                          <span className="text-gray-500 font-normal ml-1">
                            · {format(new Date(fb.replied_at), 'MMM d, yyyy h:mm a')}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">
                        {fb.admin_reply}
                      </p>
                    </div>
                  )}

                  {/* Reply composer */}
                  {openReplyId === fb.id && (
                    <div className="mb-3">
                      <textarea
                        value={replyDrafts[fb.id] || ''}
                        onChange={(e) =>
                          setReplyDrafts((d) => ({ ...d, [fb.id]: e.target.value }))
                        }
                        rows={3}
                        placeholder="Write a reply to the parent..."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOpenReplyId(null)}
                          disabled={savingReplyId === fb.id}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSendReply(fb.id)}
                          disabled={
                            savingReplyId === fb.id ||
                            !(replyDrafts[fb.id] || '').trim()
                          }
                        >
                          {savingReplyId === fb.id ? (
                            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5 mr-1" />
                          )}
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end flex-wrap">
                    {openReplyId !== fb.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setOpenReplyId(fb.id);
                          setReplyDrafts((d) => ({
                            ...d,
                            [fb.id]: d[fb.id] ?? fb.admin_reply ?? '',
                          }));
                        }}
                        className="text-violet-700 border-violet-200 hover:bg-violet-50"
                      >
                        <ReplyIcon className="w-3.5 h-3.5 mr-1" />
                        {fb.admin_reply ? 'Edit Reply' : 'Reply'}
                      </Button>
                    )}
                    {fb.status === 'NEW' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkReviewed(fb.id)}
                        className="text-green-700 border-green-200 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Mark Reviewed
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(fb.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSchoolFeedback;
