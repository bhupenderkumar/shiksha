import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, BookOpen, CheckCircle, Clock, FileText, Trash2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { PageAnimation } from '@/components/ui/page-animation';
import { syllabusService, type SyllabusType, type CreateSyllabusData } from '@/services/syllabusService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

export default function Syllabus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syllabi, setSyllabi] = useState<SyllabusType[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [formData, setFormData] = useState<CreateSyllabusData>({
    classId: '',
    subjectId: '',
    academicYear: '2026-27',
    title: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, [selectedClass]);

  async function loadData() {
    try {
      setLoading(true);
      const [syllabiData, classData] = await Promise.all([
        syllabusService.getAll(selectedClass || undefined),
        supabase.schema(SCHEMA).from('Class').select('id, name, section').order('name'),
      ]);
      setSyllabi(syllabiData);
      if (classData.data) setClasses(classData.data);
    } catch (err) {
      toast.error('Failed to load syllabi');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjects(classId: string) {
    const { data } = await supabase
      .schema(SCHEMA)
      .from('Subject')
      .select('id, name, code')
      .eq('classId', classId)
      .order('name');
    setSubjects(data || []);
  }

  async function handleCreate() {
    if (!formData.classId || !formData.subjectId || !formData.title) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setCreating(true);
      await syllabusService.create(formData);
      toast.success('Syllabus created');
      setShowCreate(false);
      setFormData({ classId: '', subjectId: '', academicYear: '2026-27', title: '', description: '' });
      await loadData();
    } catch (err) {
      toast.error('Failed to create syllabus');
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this syllabus and all its chapters?')) return;
    try {
      await syllabusService.delete(id);
      toast.success('Syllabus deleted');
      await loadData();
    } catch (err) {
      toast.error('Failed to delete syllabus');
    }
  }

  async function handleApprove(id: string) {
    try {
      await syllabusService.approve(id, user?.id || '');
      toast.success('Syllabus approved');
      await loadData();
    } catch (err) {
      toast.error('Failed to approve syllabus');
    }
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'draft':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) return <div className="flex justify-center p-8"><LoadingSpinner /></div>;

  return (
    <PageAnimation>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Syllabus Management</h1>
            <p className="text-muted-foreground">Academic Year 2026-27</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> Add Syllabus</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Syllabus</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Class</Label>
                  <Select value={formData.classId} onValueChange={(v) => {
                    setFormData(prev => ({ ...prev, classId: v, subjectId: '' }));
                    loadSubjects(v);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Select value={formData.subjectId} onValueChange={(v) => setFormData(prev => ({ ...prev, subjectId: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Hindi Syllabus Nursery A"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the syllabus"
                  />
                </div>
                <div>
                  <Label>Academic Year</Label>
                  <Input
                    value={formData.academicYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreate} disabled={creating} className="w-full">
                  {creating ? 'Creating...' : 'Create Syllabus'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Class filter */}
        <div className="mb-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Syllabi list */}
        {syllabi.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No syllabi found. Create one to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {syllabi.map(s => (
              <Card
                key={s.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/syllabus/${s.id}`)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{s.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.class?.name} {s.class?.section} — {s.subject?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(s.status)}
                    {s.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => { e.stopPropagation(); handleApprove(s.id); }}
                      >
                        Approve
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageAnimation>
  );
}
