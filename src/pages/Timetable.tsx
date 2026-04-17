import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Clock, Plus, Trash2, Save, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageAnimation } from '@/components/ui/page-animation';
import { timetableService, type TimetableEntry, type CreateTimetableEntry } from '@/services/timetableService';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const DAY_COLORS: Record<number, string> = {
  1: 'bg-blue-50 border-blue-200',
  2: 'bg-green-50 border-green-200',
  3: 'bg-purple-50 border-purple-200',
  4: 'bg-orange-50 border-orange-200',
  5: 'bg-pink-50 border-pink-200',
  6: 'bg-yellow-50 border-yellow-200',
};

const DEFAULT_PERIODS = [
  { periodNumber: 1, startTime: '08:00', endTime: '08:45' },
  { periodNumber: 2, startTime: '08:45', endTime: '09:30' },
  { periodNumber: 3, startTime: '09:30', endTime: '10:15' },
  { periodNumber: 4, startTime: '10:30', endTime: '11:15' },
  { periodNumber: 5, startTime: '11:15', endTime: '12:00' },
  { periodNumber: 6, startTime: '12:30', endTime: '01:15' },
  { periodNumber: 7, startTime: '01:15', endTime: '02:00' },
];

export default function Timetable() {
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 1);

  // New entry form
  const [newEntry, setNewEntry] = useState<Partial<CreateTimetableEntry>>({
    day: selectedDay,
    periodNumber: 1,
    startTime: '08:00',
    endTime: '08:45',
  });

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTimetable();
      loadSubjects();
    }
  }, [selectedClass]);

  async function loadClasses() {
    try {
      const { data } = await supabase
        .schema(SCHEMA)
        .from('Class')
        .select('id, name, section')
        .order('name');
      setClasses(data || []);
      if (data && data.length > 0) setSelectedClass(data[0].id);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  async function loadSubjects() {
    try {
      const { data } = await supabase
        .schema(SCHEMA as any)
        .from('Subject')
        .select('id, name, code')
        .eq('classId', selectedClass);
      setSubjects(data || []);
    } catch {
      console.error('Failed to load subjects');
    }
  }

  async function loadTimetable() {
    try {
      setLoading(true);
      const data = await timetableService.getByClass(selectedClass);
      setEntries(data);
    } catch {
      toast.error('Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddEntry() {
    if (!newEntry.subjectId) {
      toast.error('Select a subject');
      return;
    }
    try {
      setSaving(true);
      await timetableService.create({
        classId: selectedClass,
        subjectId: newEntry.subjectId!,
        day: newEntry.day || selectedDay,
        startTime: newEntry.startTime || '08:00',
        endTime: newEntry.endTime || '08:45',
        periodNumber: newEntry.periodNumber || 1,
        teacherName: newEntry.teacherName,
        room: newEntry.room,
      });
      toast.success('Period added');
      await loadTimetable();
      // Auto-increment period
      setNewEntry(prev => ({
        ...prev,
        periodNumber: (prev.periodNumber || 1) + 1,
        subjectId: undefined,
      }));
    } catch (err: any) {
      if (err.message?.includes('unique')) {
        toast.error('This period slot is already taken');
      } else {
        toast.error('Failed to add period');
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    try {
      await timetableService.delete(id);
      setEntries(prev => prev.filter(e => e.id !== id));
      toast.success('Period removed');
    } catch {
      toast.error('Failed to remove period');
    }
  }

  async function handleQuickFill() {
    if (subjects.length === 0) {
      toast.error('No subjects configured for this class');
      return;
    }
    try {
      setSaving(true);
      const entriesToCreate: CreateTimetableEntry[] = [];
      for (const day of DAYS) {
        for (const period of DEFAULT_PERIODS) {
          const subjectIdx = (day.value * 7 + period.periodNumber) % subjects.length;
          entriesToCreate.push({
            classId: selectedClass,
            subjectId: subjects[subjectIdx].id,
            day: day.value,
            ...period,
          });
        }
      }
      // Clear existing first
      await timetableService.deleteByClass(selectedClass);
      await timetableService.bulkCreate(entriesToCreate);
      toast.success('Timetable generated! Edit as needed.');
      await loadTimetable();
    } catch {
      toast.error('Failed to generate timetable');
    } finally {
      setSaving(false);
    }
  }

  const entriesByDay = DAYS.map(day => ({
    ...day,
    entries: entries.filter(e => e.day === day.value).sort((a, b) => a.periodNumber - b.periodNumber),
  }));

  const todayEntries = entriesByDay.find(d => d.value === (new Date().getDay() || 1));

  if (loading && classes.length === 0) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <PageAnimation>
      <div className="container mx-auto p-4 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              Timetable
            </h1>
            <p className="text-muted-foreground">Manage class schedules</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={editMode ? 'default' : 'outline'}
              onClick={() => setEditMode(!editMode)}
              size="sm"
            >
              {editMode ? 'Done' : 'Edit'}
            </Button>
          </div>
        </div>

        {/* Today highlight */}
        {todayEntries && todayEntries.entries.length > 0 && !editMode && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today — {todayEntries.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap gap-2">
                {todayEntries.entries.map(entry => (
                  <Badge key={entry.id} variant="secondary" className="text-sm py-1 px-3">
                    P{entry.periodNumber}: {entry.subject?.name || 'Subject'} ({entry.startTime}–{entry.endTime})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit mode: Add period + Quick fill */}
        {editMode && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Add Period</CardTitle>
                {entries.length === 0 && (
                  <Button variant="outline" size="sm" onClick={handleQuickFill} disabled={saving}>
                    ✨ Auto-Fill Timetable
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select value={String(newEntry.day)} onValueChange={v => setNewEntry(p => ({ ...p, day: Number(v) }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Select value={newEntry.subjectId || ''} onValueChange={v => setNewEntry(p => ({ ...p, subjectId: v }))}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Period #</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newEntry.periodNumber}
                    onChange={e => setNewEntry(p => ({ ...p, periodNumber: Number(e.target.value) }))}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Time</Label>
                  <div className="flex gap-1">
                    <Input
                      type="time"
                      value={newEntry.startTime}
                      onChange={e => setNewEntry(p => ({ ...p, startTime: e.target.value }))}
                      className="h-9 text-xs"
                    />
                    <Input
                      type="time"
                      value={newEntry.endTime}
                      onChange={e => setNewEntry(p => ({ ...p, endTime: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>
              <Button onClick={handleAddEntry} disabled={saving} size="sm" className="mt-3">
                <Plus className="w-4 h-4 mr-1" />
                {saving ? 'Adding...' : 'Add Period'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {entries.length === 0 && !loading && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No timetable set</p>
              <p className="text-muted-foreground mb-4">Click Edit to configure the class schedule.</p>
              <Button onClick={() => { setEditMode(true); handleQuickFill(); }} disabled={saving}>
                ✨ Auto-Generate Timetable
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Weekly view */}
        {entries.length > 0 && (
          <div className="space-y-4">
            {entriesByDay.filter(d => d.entries.length > 0).map(day => (
              <Card key={day.value} className={DAY_COLORS[day.value]}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">{day.label}</CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid gap-2">
                    {day.entries.map(entry => (
                      <div key={entry.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-muted-foreground w-6">P{entry.periodNumber}</span>
                          <span className="text-xs text-muted-foreground">{entry.startTime}–{entry.endTime}</span>
                          <span className="font-medium text-sm">{entry.subject?.name || 'Subject'}</span>
                        </div>
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    ))}
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
