import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
import { Clock, Plus, Trash2, Pencil, X, Check, Calendar, ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { timetableService, type TimetableEntry, type CreateTimetableEntry } from '@/services/timetableService';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { useAuth } from '@/lib/auth-provider';
import { useProfileAccess } from '@/services/profileService';

const DAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const DAY_COLORS: Record<number, string> = {
  1: 'bg-blue-50 border-blue-200',
  2: 'bg-green-50 border-green-200',
  3: 'bg-purple-50 border-purple-200',
  4: 'bg-orange-50 border-orange-200',
  5: 'bg-pink-50 border-pink-200',
  6: 'bg-yellow-50 border-yellow-200',
};

const SUBJECT_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-300',
  'bg-green-100 text-green-800 border-green-300',
  'bg-purple-100 text-purple-800 border-purple-300',
  'bg-orange-100 text-orange-800 border-orange-300',
  'bg-pink-100 text-pink-800 border-pink-300',
  'bg-teal-100 text-teal-800 border-teal-300',
  'bg-indigo-100 text-indigo-800 border-indigo-300',
  'bg-amber-100 text-amber-800 border-amber-300',
  'bg-rose-100 text-rose-800 border-rose-300',
  'bg-cyan-100 text-cyan-800 border-cyan-300',
];

const DEFAULT_PERIODS = [
  { periodNumber: 1, startTime: '08:00', endTime: '08:45' },
  { periodNumber: 2, startTime: '08:45', endTime: '09:30' },
  { periodNumber: 3, startTime: '09:30', endTime: '10:15' },
  { periodNumber: 4, startTime: '10:30', endTime: '11:15' },
  { periodNumber: 5, startTime: '11:15', endTime: '12:00' },
  { periodNumber: 6, startTime: '12:30', endTime: '01:15' },
  { periodNumber: 7, startTime: '01:15', endTime: '02:00' },
];

function getSubjectColor(subjectId: string, allSubjectIds: string[]) {
  const idx = allSubjectIds.indexOf(subjectId);
  return SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
}

export default function Timetable() {
  const { user } = useAuth();
  const { isAdminOrTeacher } = useProfileAccess();
  const canEdit = isAdminOrTeacher;

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const todayNum = new Date().getDay() || 1; // default to Monday if Sunday
  const [selectedDay, setSelectedDay] = useState(todayNum);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CreateTimetableEntry>>({});

  // New entry form
  const [newEntry, setNewEntry] = useState<Partial<CreateTimetableEntry>>({
    day: selectedDay,
    periodNumber: 1,
    startTime: '08:00',
    endTime: '08:45',
  });

  // Track unique subject IDs for color mapping
  const allSubjectIds = useMemo(() => {
    const ids = new Set<string>();
    entries.forEach(e => ids.add(e.subjectId));
    return Array.from(ids);
  }, [entries]);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadTimetable();
      if (canEdit) loadSubjects();
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

  async function handleUpdateEntry(id: string) {
    try {
      setSaving(true);
      await timetableService.update(id, editForm);
      toast.success('Period updated');
      setEditingEntryId(null);
      setEditForm({});
      await loadTimetable();
    } catch (err: any) {
      if (err.message?.includes('unique')) {
        toast.error('This period slot is already taken');
      } else {
        toast.error('Failed to update period');
      }
    } finally {
      setSaving(false);
    }
  }

  function startEditing(entry: TimetableEntry) {
    setEditingEntryId(entry.id);
    setEditForm({
      subjectId: entry.subjectId,
      startTime: entry.startTime,
      endTime: entry.endTime,
      periodNumber: entry.periodNumber,
      teacherName: entry.teacherName || undefined,
      room: entry.room || undefined,
    });
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

  const todayEntries = entriesByDay.find(d => d.value === todayNum);
  const selectedDayData = entriesByDay.find(d => d.value === selectedDay);
  const selectedClassName = classes.find(c => c.id === selectedClass);

  function navigateDay(dir: number) {
    const currentIdx = DAYS.findIndex(d => d.value === selectedDay);
    const nextIdx = (currentIdx + dir + DAYS.length) % DAYS.length;
    setSelectedDay(DAYS[nextIdx].value);
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Class Timetable"
        subtitle={selectedClassName ? `${selectedClassName.name} ${selectedClassName.section || ''}`.trim() : 'Weekly schedule and periods'}
        icon={<Calendar className="text-primary-500" />}
        action={
          canEdit ? (
            <Button
              variant={editMode ? 'default' : 'outline'}
              onClick={() => { setEditMode(!editMode); setEditingEntryId(null); }}
              size="sm"
              className="text-xs sm:text-sm"
            >
              {editMode ? 'Done Editing' : 'Edit'}
            </Button>
          ) : null
        }
      />

      {/* Class selector + View toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
          <Button
            variant={viewMode === 'day' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setViewMode('day')}
          >
            <List className="w-3.5 h-3.5 mr-1" />
            Day
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setViewMode('week')}
          >
            <LayoutGrid className="w-3.5 h-3.5 mr-1" />
            Week
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      {entries.length > 0 && (
        <div className="flex items-center gap-3 mb-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
            <span className="font-medium text-foreground">{entries.length}</span> periods
          </div>
          <Badge variant="outline" className="text-[10px] gap-1 bg-blue-50 text-blue-700 border-blue-200 whitespace-nowrap">
            <Calendar className="w-3 h-3" /> {entriesByDay.filter(d => d.entries.length > 0).length} days
          </Badge>
          {subjects.length > 0 && (
            <Badge variant="outline" className="text-[10px] gap-1 bg-purple-50 text-purple-700 border-purple-200 whitespace-nowrap">
              {subjects.length} subjects
            </Badge>
          )}
        </div>
      )}

        {/* Today highlight - shown in week view or when not viewing today */}
        {!editMode && todayEntries && todayEntries.entries.length > 0 && viewMode === 'week' && (
          <Card className="mb-4 border-primary/30 bg-primary/5">
            <CardHeader className="pb-2 pt-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today — {todayEntries.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap gap-1.5">
                {todayEntries.entries.map(entry => (
                  <Badge key={entry.id} variant="secondary" className="text-xs py-1 px-2">
                    P{entry.periodNumber}: {entry.subject?.name || 'Subject'} ({entry.startTime}–{entry.endTime})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit mode: Add period + Quick fill */}
        {editMode && canEdit && (
          <Card className="mb-4 border-dashed border-2">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Add Period</CardTitle>
                <Button variant="outline" size="sm" onClick={handleQuickFill} disabled={saving} className="text-xs h-7">
                  ✨ Auto-Fill
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <div className="space-y-1">
                  <Label className="text-xs">Day</Label>
                  <Select value={String(newEntry.day)} onValueChange={v => setNewEntry(p => ({ ...p, day: Number(v) }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Subject</Label>
                  <Select value={newEntry.subjectId || ''} onValueChange={v => setNewEntry(p => ({ ...p, subjectId: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
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
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Start</Label>
                  <Input
                    type="time"
                    value={newEntry.startTime}
                    onChange={e => setNewEntry(p => ({ ...p, startTime: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End</Label>
                  <Input
                    type="time"
                    value={newEntry.endTime}
                    onChange={e => setNewEntry(p => ({ ...p, endTime: e.target.value }))}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Activity / Notes</Label>
                  <Input
                    placeholder="e.g. Hindi Copy, Book Reading"
                    value={newEntry.room || ''}
                    onChange={e => setNewEntry(p => ({ ...p, room: e.target.value || undefined }))}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <Button onClick={handleAddEntry} disabled={saving} size="sm" className="mt-3 h-8 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" />
                {saving ? 'Adding...' : 'Add Period'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty state */}
        {entries.length === 0 && !loading && (
          <EmptyState
            title="No timetable set"
            description={canEdit ? 'Click Edit to configure the class schedule.' : 'Timetable has not been configured yet.'}
            icon={<Calendar className="w-16 h-16 text-muted-foreground" />}
            action={
              canEdit ? (
                <Button onClick={() => { setEditMode(true); handleQuickFill(); }} disabled={saving} size="sm">
                  ✨ Auto-Generate Timetable
                </Button>
              ) : undefined
            }
          />
        )}

        {/* DAY VIEW - Mobile optimized single day view */}
        {!loading && entries.length > 0 && viewMode === 'day' && (
          <div>
            {/* Day navigation */}
            <div className="flex items-center justify-between mb-3 bg-muted/50 rounded-lg p-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateDay(-1)}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex gap-1 overflow-x-auto">
                {DAYS.map(d => (
                  <Button
                    key={d.value}
                    variant={selectedDay === d.value ? 'default' : 'ghost'}
                    size="sm"
                    className={`h-8 px-2 sm:px-3 text-xs ${d.value === todayNum && selectedDay !== d.value ? 'ring-2 ring-primary/30' : ''}`}
                    onClick={() => setSelectedDay(d.value)}
                  >
                    <span className="sm:hidden">{d.short}</span>
                    <span className="hidden sm:inline">{d.label}</span>
                    {d.value === todayNum && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                  </Button>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigateDay(1)}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Day entries */}
            {selectedDayData && selectedDayData.entries.length > 0 ? (
              <div className="space-y-2">
                {selectedDayData.entries.map((entry, idx) => {
                  const isEditing = editingEntryId === entry.id;
                  const colorClass = getSubjectColor(entry.subjectId, allSubjectIds);

                  if (isEditing && editMode) {
                    return (
                      <Card key={entry.id} className="border-2 border-primary/50">
                        <CardContent className="p-3">
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            <div className="space-y-1">
                              <Label className="text-xs">Subject</Label>
                              <Select value={editForm.subjectId || ''} onValueChange={v => setEditForm(p => ({ ...p, subjectId: v }))}>
                                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Period #</Label>
                              <Input
                                type="number" min={1} max={10}
                                value={editForm.periodNumber}
                                onChange={e => setEditForm(p => ({ ...p, periodNumber: Number(e.target.value) }))}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Start</Label>
                              <Input
                                type="time"
                                value={editForm.startTime}
                                onChange={e => setEditForm(p => ({ ...p, startTime: e.target.value }))}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">End</Label>
                              <Input
                                type="time"
                                value={editForm.endTime}
                                onChange={e => setEditForm(p => ({ ...p, endTime: e.target.value }))}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Teacher</Label>
                              <Input
                                placeholder="Teacher name"
                                value={editForm.teacherName || ''}
                                onChange={e => setEditForm(p => ({ ...p, teacherName: e.target.value || undefined }))}
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Activity / Notes</Label>
                              <Input
                                placeholder="e.g. Hindi Copy, Book Reading"
                                value={editForm.room || ''}
                                onChange={e => setEditForm(p => ({ ...p, room: e.target.value || undefined }))}
                                className="h-8 text-xs"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" className="h-7 text-xs" onClick={() => handleUpdateEntry(entry.id)} disabled={saving}>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              Save
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEditingEntryId(null); setEditForm({}); }}>
                              <X className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }

                  return (
                    <div
                      key={entry.id}
                      className={`rounded-lg border px-3 py-3 flex items-center gap-3 ${colorClass} ${idx === 0 ? '' : ''}`}
                    >
                      {/* Period number */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-xs font-bold">
                        {entry.periodNumber}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">
                          {entry.room || entry.subject?.name || 'Subject'}
                        </div>
                        <div className="flex items-center gap-2 text-xs opacity-75 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {entry.startTime} – {entry.endTime}
                          </span>
                          {entry.room && (
                            <span className="bg-white/50 px-1.5 py-0.5 rounded text-[10px]">
                              {entry.subject?.name}
                            </span>
                          )}
                          {entry.teacherName && <span>· {entry.teacherName}</span>}
                        </div>
                      </div>

                      {/* Edit/Delete buttons */}
                      {editMode && canEdit && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditing(entry)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteEntry(entry.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No periods scheduled for {DAYS.find(d => d.value === selectedDay)?.label}
              </div>
            )}
          </div>
        )}

        {/* WEEK VIEW - Grid/Table view */}
        {!loading && entries.length > 0 && viewMode === 'week' && (
          <div className="space-y-3">
            {entriesByDay.filter(d => d.entries.length > 0).map(day => (
              <Card key={day.value} className={`${DAY_COLORS[day.value]} ${day.value === todayNum ? 'ring-2 ring-primary/40' : ''}`}>
                <CardHeader className="pb-1 pt-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    {day.label}
                    {day.value === todayNum && <Badge variant="default" className="text-[10px] h-4 px-1.5">Today</Badge>}
                    <span className="text-xs font-normal text-muted-foreground ml-auto">{day.entries.length} periods</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="grid gap-1.5">
                    {day.entries.map(entry => {
                      const isEditing = editingEntryId === entry.id;

                      if (isEditing && editMode) {
                        return (
                          <div key={entry.id} className="bg-white rounded-lg p-3 shadow-sm border-2 border-primary/50">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Subject</Label>
                                <Select value={editForm.subjectId || ''} onValueChange={v => setEditForm(p => ({ ...p, subjectId: v }))}>
                                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Period</Label>
                                <Input type="number" min={1} max={10} value={editForm.periodNumber}
                                  onChange={e => setEditForm(p => ({ ...p, periodNumber: Number(e.target.value) }))} className="h-8 text-xs" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Start</Label>
                                <Input type="time" value={editForm.startTime}
                                  onChange={e => setEditForm(p => ({ ...p, startTime: e.target.value }))} className="h-8 text-xs" />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">End</Label>
                                <Input type="time" value={editForm.endTime}
                                  onChange={e => setEditForm(p => ({ ...p, endTime: e.target.value }))} className="h-8 text-xs" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input placeholder="Teacher" value={editForm.teacherName || ''}
                                onChange={e => setEditForm(p => ({ ...p, teacherName: e.target.value || undefined }))} className="h-8 text-xs" />
                              <Input placeholder="e.g. Hindi Copy" value={editForm.room || ''}
                                onChange={e => setEditForm(p => ({ ...p, room: e.target.value || undefined }))} className="h-8 text-xs" />
                            </div>
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" className="h-7 text-xs" onClick={() => handleUpdateEntry(entry.id)} disabled={saving}>
                                <Check className="w-3.5 h-3.5 mr-1" /> Save
                              </Button>
                              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setEditingEntryId(null); setEditForm({}); }}>
                                <X className="w-3.5 h-3.5 mr-1" /> Cancel
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={entry.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground w-5 flex-shrink-0">P{entry.periodNumber}</span>
                            <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:inline">{entry.startTime}–{entry.endTime}</span>
                            <span className="font-medium text-sm truncate">{entry.room || entry.subject?.name || 'Subject'}</span>
                            {entry.room && <span className="text-[10px] text-muted-foreground hidden sm:inline">({entry.subject?.name})</span>}
                            {entry.teacherName && <span className="text-xs text-muted-foreground hidden sm:inline">· {entry.teacherName}</span>}
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground sm:hidden">{entry.startTime}</span>
                            {editMode && canEdit && (
                              <>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => startEditing(entry)}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteEntry(entry.id)}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Legend - Subject colors (day view) */}
        {!loading && entries.length > 0 && viewMode === 'day' && (
          <Card className="mt-6">
            <CardContent className="py-3 px-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {subjects.length > 0 ? subjects.map(s => (
                  <span key={s.id} className={`text-xs px-2 py-0.5 rounded border ${getSubjectColor(s.id, allSubjectIds)}`}>
                    {s.name}
                  </span>
                )) : allSubjectIds.map(id => {
                  const entry = entries.find(e => e.subjectId === id);
                  return (
                    <span key={id} className={`text-xs px-2 py-0.5 rounded border ${getSubjectColor(id, allSubjectIds)}`}>
                      {entry?.subject?.name || id}
                    </span>
                  );
            })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
