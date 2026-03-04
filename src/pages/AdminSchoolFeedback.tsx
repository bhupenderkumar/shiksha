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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const AdminSchoolFeedback: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<SchoolFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'NEW' | 'REVIEWED'>('all');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
    <div className="container mx-auto px-4 py-6 max-w-4xl">
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
            <div className="flex gap-2">
              {(['all', 'NEW', 'REVIEWED'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f)}
                >
                  <Filter className="w-3 h-3 mr-1" />
                  {f === 'all' ? 'All' : f === 'NEW' ? 'New' : 'Reviewed'}
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
                      : 'bg-white border-gray-200'
                  )}
                >
                  {/* Top row: rating + status + date */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {renderStars(fb.rating)}
                      {fb.status === 'NEW' ? (
                        <Badge
                          variant="outline"
                          className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          New
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-xs"
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
                    <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3 mb-3">
                      {fb.message}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 justify-end">
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
