import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  ArrowLeft, Plus, CheckCircle, Circle, Clock, SkipForward,
  BookOpen, AlertTriangle, Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { syllabusService, type SyllabusType, type SyllabusItemType, type CreateSyllabusItemData } from '@/services/syllabusService';
import { useAuth } from '@/lib/auth-provider';

export default function SyllabusDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syllabus, setSyllabus] = useState<SyllabusType | null>(null);
  const [items, setItems] = useState<SyllabusItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [addingChapter, setAddingChapter] = useState(false);
  const [chapterForm, setChapterForm] = useState({
    chapterNumber: 1,
    title: '',
    description: '',
    estimatedDays: 5,
  });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  async function loadData() {
    try {
      setLoading(true);
      const [syllabusData, itemsData] = await Promise.all([
        syllabusService.getById(id!),
        syllabusService.getItems(id!, undefined),
      ]);
      setSyllabus(syllabusData);

      // Also load progress for the syllabus's class
      if (syllabusData.classId) {
        const itemsWithProgress = await syllabusService.getItems(id!, syllabusData.classId);
        setItems(itemsWithProgress);
      } else {
        setItems(itemsData);
      }
    } catch (err) {
      toast.error('Failed to load syllabus');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddChapter() {
    if (!chapterForm.title) {
      toast.error('Chapter title is required');
      return;
    }
    try {
      setAddingChapter(true);
      await syllabusService.createItem({
        syllabusId: id!,
        chapterNumber: chapterForm.chapterNumber,
        title: chapterForm.title,
        description: chapterForm.description || undefined,
        estimatedDays: chapterForm.estimatedDays,
        sortOrder: items.length,
      });
      toast.success('Chapter added');
      setShowAddChapter(false);
      setChapterForm({ chapterNumber: items.length + 2, title: '', description: '', estimatedDays: 5 });
      await loadData();
    } catch (err) {
      toast.error('Failed to add chapter');
    } finally {
      setAddingChapter(false);
    }
  }

  async function handleDeleteChapter(itemId: string) {
    if (!confirm('Delete this chapter?')) return;
    try {
      await syllabusService.deleteItem(itemId);
      toast.success('Chapter deleted');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete chapter');
    }
  }

  async function handleToggleProgress(item: SyllabusItemType) {
    if (!syllabus) return;
    const currentStatus = item.progress?.status || 'not_started';
    const nextStatus = {
      not_started: 'in_progress',
      in_progress: 'completed',
      completed: 'not_started',
      skipped: 'not_started',
    }[currentStatus] as 'not_started' | 'in_progress' | 'completed';

    try {
      await syllabusService.markProgress(item.id, syllabus.classId, nextStatus, user?.id);
      await loadData();
      toast.success(`Chapter marked as ${nextStatus.replace('_', ' ')}`);
    } catch (err) {
      toast.error('Failed to update progress');
    }
  }

  const getProgressIcon = (status: string | undefined) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'skipped':
        return <SkipForward className="w-5 h-5 text-gray-400" />;
      default:
        return <Circle className="w-5 h-5 text-gray-300" />;
    }
  };

  const completedCount = items.filter(i => i.progress?.status === 'completed').length;
  const progressPercent = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!syllabus) return <div className="p-8 text-center">Syllabus not found.</div>;

  return (
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <PageHeader
          title={syllabus.title}
          subtitle={`${syllabus.class?.name} ${syllabus.class?.section} — ${syllabus.subject?.name} — ${syllabus.academicYear}`}
          icon={BookOpen}
          action={
            <Button variant="outline" size="sm" onClick={() => navigate('/syllabus')}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          }
        />

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{syllabus.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {syllabus.class?.name} {syllabus.class?.section} — {syllabus.subject?.name} — {syllabus.academicYear}
                </p>
              </div>
              <Badge className={syllabus.status === 'approved' ? 'bg-green-100 text-green-800' : ''}>
                {syllabus.status}
              </Badge>
            </div>
            {syllabus.description && (
              <p className="text-sm text-muted-foreground mt-2">{syllabus.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress: {completedCount}/{items.length} chapters</span>
                  <span>{progressPercent}%</span>
                </div>
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapters */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chapters</h2>
          <Dialog open={showAddChapter} onOpenChange={setShowAddChapter}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" /> Add Chapter</Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
              <DialogHeader>
                <DialogTitle>Add Chapter</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Chapter Number</Label>
                  <Input
                    type="number"
                    value={chapterForm.chapterNumber}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, chapterNumber: parseInt(e.target.value) || 1 }))}
                  />
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={chapterForm.title}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., वर्णमाला (Alphabets)"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={chapterForm.description}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Scope of the chapter"
                  />
                </div>
                <div>
                  <Label>Estimated Days</Label>
                  <Input
                    type="number"
                    value={chapterForm.estimatedDays}
                    onChange={(e) => setChapterForm(prev => ({ ...prev, estimatedDays: parseInt(e.target.value) || 5 }))}
                  />
                </div>
                <Button onClick={handleAddChapter} disabled={addingChapter} className="w-full">
                  {addingChapter ? 'Adding...' : 'Add Chapter'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No chapters yet. Add chapters to build the syllabus.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const status = item.progress?.status || 'not_started';
              const isOverEstimate = item.progress?.actualDays && item.progress.actualDays > (item.estimatedDays * 1.5);

              return (
                <Card key={item.id} className="transition-all hover:shadow-sm">
                  <CardContent className="flex items-center gap-3 p-4">
                    <button
                      onClick={() => handleToggleProgress(item)}
                      className="flex-shrink-0 hover:opacity-80 transition-opacity"
                      title={`Status: ${status.replace('_', ' ')}. Click to change.`}
                    >
                      {getProgressIcon(status)}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">
                        Ch {item.chapterNumber}: {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.estimatedDays} days est.</span>
                        {item.progress?.actualDays && (
                          <span>• {item.progress.actualDays} days actual</span>
                        )}
                        {item.progress?.startedDate && (
                          <span>• Started {item.progress.startedDate}</span>
                        )}
                        {item.progress?.completedDate && (
                          <span>• Done {item.progress.completedDate}</span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1 truncate">{item.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {isOverEstimate && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" title="Taking longer than estimated" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {status.replace('_', ' ')}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteChapter(item.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
  );
}
