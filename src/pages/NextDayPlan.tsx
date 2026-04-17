import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BookOpen, Mic, Pencil, CheckCircle, AlertTriangle,
  Clock, Brain, FileText, Flag, ChevronDown, ChevronUp,
  Sparkles, Info, RefreshCw, Plus, Trash2, PenLine, Save, Trash, Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageAnimation } from '@/components/ui/page-animation';
import { nextDayPlanService, type NextDayPlanType, type NextDayPlanItemType, type CreatePlanItemData } from '@/services/nextDayPlanService';
import { aiFlagService, type AiFlagRecord } from '@/services/aiFlagService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import { AiPhotoValidator } from '@/components/AiPhotoValidator';
import { fileTableService } from '@/services/fileTableService';

type ViewMode = 'today' | 'report' | 'plan';

interface ManualPlanItem {
  key: string;
  subjectId: string;
  chapterName: string;
  oralWork: string;
  oralDetails: string;
  writingWork: string;
  writingDetails: string;
  homeworkTitle: string;
  homeworkDescription: string;
}

const emptyItem = (): ManualPlanItem => ({
  key: crypto.randomUUID(),
  subjectId: '',
  chapterName: '',
  oralWork: '',
  oralDetails: '',
  writingWork: '',
  writingDetails: '',
  homeworkTitle: '',
  homeworkDescription: '',
});

export default function NextDayPlan() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [materializing, setMaterializing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('plan');

  // Today's plan data
  const [todayPlan, setTodayPlan] = useState<NextDayPlanType | null>(null);
  const [todayItems, setTodayItems] = useState<NextDayPlanItemType[]>([]);
  const [todayClasswork, setTodayClasswork] = useState<any[]>([]);

  // Tomorrow's plan data
  const [tomorrowPlan, setTomorrowPlan] = useState<NextDayPlanType | null>(null);
  const [tomorrowItems, setTomorrowItems] = useState<NextDayPlanItemType[]>([]);

  // End of day report
  const [report, setReport] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Flags
  const [flags, setFlags] = useState<AiFlagRecord[]>([]);

  // Expanded items
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Manual plan form
  const [showManualForm, setShowManualForm] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [manualItems, setManualItems] = useState<ManualPlanItem[]>([emptyItem()]);
  const [savingManual, setSavingManual] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      loadPlanData();
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
      if (data && data.length > 0) {
        setSelectedClass(data[0].id);
      }
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

  async function loadPlanData() {
    try {
      setLoading(true);

      const [todayPlanData, tomorrowPlanData, classworkData, flagsData] = await Promise.all([
        nextDayPlanService.getByClassAndDate(selectedClass, today).catch(() => null),
        nextDayPlanService.getByClassAndDate(selectedClass, tomorrow).catch(() => null),
        supabase
          .schema(SCHEMA)
          .from('Classwork')
          .select('*, attachments:File(*)')
          .eq('classId', selectedClass)
          .eq('date', today),
        aiFlagService.getByClass(selectedClass).catch(() => []),
      ]);

      setTodayPlan(todayPlanData);
      setTomorrowPlan(tomorrowPlanData);
      setTodayClasswork(classworkData.data || []);
      setFlags(flagsData);

      if (todayPlanData) {
        const items = await nextDayPlanService.getItems(todayPlanData.id).catch((e) => {
          console.error('Failed to load today items:', e);
          return [];
        });
        setTodayItems(items);
      } else {
        setTodayItems([]);
      }

      if (tomorrowPlanData) {
        const items = await nextDayPlanService.getItems(tomorrowPlanData.id).catch((e) => {
          console.error('Failed to load tomorrow items:', e);
          return [];
        });
        setTomorrowItems(items);
      } else {
        setTomorrowItems([]);
      }
    } catch (err) {
      console.error('Error loading plan data:', err);
      toast.error('Failed to load plan data');
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan() {
    if (!selectedClass) return;
    try {
      setGenerating(true);
      // Delete existing plan for this class+date to avoid unique constraint violation
      if (tomorrowPlan) {
        await nextDayPlanService.delete(tomorrowPlan.id);
      }
      await aiService.generateNextDayPlan(selectedClass, tomorrow, user?.id);
      toast.success("Tomorrow's plan generated!");
      setShowManualForm(false);
      await loadPlanData();
      setViewMode('plan');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveManualPlan() {
    if (!selectedClass) return;

    const validItems = manualItems.filter(item => item.subjectId && (item.oralWork || item.writingWork));
    if (validItems.length === 0) {
      toast.error('Add at least one subject with oral or writing work');
      return;
    }

    try {
      setSavingManual(true);

      // Delete existing plan if any
      if (tomorrowPlan) {
        await nextDayPlanService.delete(tomorrowPlan.id);
      }

      const planItems: CreatePlanItemData[] = validItems.map((item, index) => ({
        planId: '',
        subjectId: item.subjectId,
        chapterName: item.chapterName || undefined,
        oralWork: item.oralWork || undefined,
        oralDetails: item.oralDetails || undefined,
        writingWork: item.writingWork || undefined,
        writingDetails: item.writingDetails || undefined,
        homeworkTitle: item.homeworkTitle || undefined,
        homeworkDescription: item.homeworkDescription || undefined,
        sortOrder: index,
      }));

      await nextDayPlanService.savePlan(
        selectedClass,
        tomorrow,
        { source: 'manual' },
        planItems,
        user?.id
      );

      // Update status to teacher_edited since it's manual
      const plan = await nextDayPlanService.getByClassAndDate(selectedClass, tomorrow);
      if (plan) {
        await nextDayPlanService.updateStatus(plan.id, 'teacher_edited', user?.id);
      }

      toast.success('Manual plan saved!');
      setShowManualForm(false);
      setManualItems([emptyItem()]);
      await loadPlanData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save plan');
    } finally {
      setSavingManual(false);
    }
  }

  async function handleMaterialize() {
    if (!tomorrowPlan) return;
    try {
      setMaterializing(true);
      await aiService.materializePlan(tomorrowPlan.id, user?.id || '');
      toast.success('Plan materialized! Classwork & homework entries created.');
      await loadPlanData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to materialize plan');
    } finally {
      setMaterializing(false);
    }
  }

  async function handleEndOfDayReport() {
    if (!selectedClass) return;
    try {
      setReportLoading(true);
      const reportData = await aiService.generateEndOfDayReport(selectedClass, today);
      setReport(reportData);
      setViewMode('report');
      toast.success('End of day report generated!');
      await loadPlanData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate report');
    } finally {
      setReportLoading(false);
    }
  }

  async function handleFinalizePlan() {
    if (!tomorrowPlan) return;
    try {
      await nextDayPlanService.updateStatus(tomorrowPlan.id, 'finalized', user?.id);
      toast.success('Plan finalized!');
      await loadPlanData();
    } catch {
      toast.error('Failed to finalize plan');
    }
  }

  async function handleResolveFlag(flagId: string) {
    try {
      await aiFlagService.resolve(flagId, user?.id || '');
      setFlags(prev => prev.filter(f => f.id !== flagId));
      toast.success('Flag resolved');
    } catch {
      toast.error('Failed to resolve flag');
    }
  }

  async function handleDeletePlan() {
    if (!tomorrowPlan) return;
    if (!confirm('Delete tomorrow\'s plan? This cannot be undone.')) return;
    try {
      await nextDayPlanService.delete(tomorrowPlan.id);
      toast.success('Plan deleted');
      await loadPlanData();
    } catch {
      toast.error('Failed to delete plan');
    }
  }

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Manual plan item helpers
  function updateManualItem(key: string, field: keyof ManualPlanItem, value: string) {
    setManualItems(prev => prev.map(item =>
      item.key === key ? { ...item, [field]: value } : item
    ));
  }

  function addManualItem() {
    setManualItems(prev => [...prev, emptyItem()]);
  }

  function removeManualItem(key: string) {
    setManualItems(prev => prev.length > 1 ? prev.filter(item => item.key !== key) : prev);
  }

  // Count stats for today
  const classworkWithPhotos = todayClasswork.filter((c: any) => c.attachments?.length > 0).length;
  const totalPlannedClasswork = todayClasswork.filter((c: any) => c.completionStatus === 'planned' || c.completionStatus === 'completed').length;

  if (loading && classes.length === 0) {
    return <div className="flex justify-center p-8"><LoadingSpinner /></div>;
  }

  return (
    <PageAnimation>
      <div className="container mx-auto p-4 max-w-4xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              AI Planner
            </h1>
            <p className="text-muted-foreground">Daily class planning with AI</p>
          </div>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-2">
          <Button
            variant={viewMode === 'today' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('today')}
          >
            <Clock className="w-4 h-4 mr-1" /> Today
          </Button>
          <Button
            variant={viewMode === 'report' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('report')}
          >
            <FileText className="w-4 h-4 mr-1" /> Report
          </Button>
          <Button
            variant={viewMode === 'plan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('plan')}
          >
            <Sparkles className="w-4 h-4 mr-1" /> Tomorrow
          </Button>
        </div>

        {/* AI Flags Banner */}
        {flags.length > 0 && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <Flag className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-amber-900">AI Alerts ({flags.length})</span>
              </div>
              <div className="space-y-1">
                {flags.slice(0, 3).map(flag => (
                  <div key={flag.id} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      {flag.severity === 'critical' ? '🔴' : flag.severity === 'warning' ? '🟡' : '🔵'}
                      {flag.message}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6"
                      onClick={() => handleResolveFlag(flag.id)}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* TODAY VIEW */}
        {viewMode === 'today' && (
          <div className="space-y-4">
            {todayPlan ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Today's Plan — {new Date(today).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </CardTitle>
                      <Badge className={todayPlan.materialized ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {todayPlan.materialized ? '✅ Active' : todayPlan.status}
                      </Badge>
                    </div>
                    {totalPlannedClasswork > 0 && (
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{classworkWithPhotos}/{totalPlannedClasswork} photos uploaded</span>
                          <span>{Math.round((classworkWithPhotos / totalPlannedClasswork) * 100)}%</span>
                        </div>
                        <Progress value={(classworkWithPhotos / totalPlannedClasswork) * 100} className="h-2" />
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {todayItems.map((item) => (
                  <PlanItemCard
                    key={item.id}
                    item={item}
                    classwork={todayClasswork.filter((c: any) => c.sourcePlanItemId === item.id)}
                    expanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                    showUpload
                    onPhotoUploaded={loadPlanData}
                  />
                ))}

                <div className="flex gap-2">
                  <Button onClick={handleEndOfDayReport} disabled={reportLoading} className="flex-1">
                    {reportLoading ? <><LoadingSpinner /> Generating...</> : '📊 End of Day Report'}
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No plan for today</p>
                  <p className="text-muted-foreground mb-4">Switch to Tomorrow tab to create a new plan.</p>
                  <Button onClick={() => setViewMode('plan')} size="lg">
                    <Sparkles className="w-4 h-4 mr-2" /> Go to Tomorrow's Plan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* REPORT VIEW */}
        {viewMode === 'report' && (
          <div className="space-y-4">
            {todayPlan?.dayScore != null ? (
              <EndOfDayReportView
                plan={todayPlan}
                report={report}
                onGeneratePlan={handleGeneratePlan}
                generating={generating}
              />
            ) : report ? (
              <EndOfDayReportView
                plan={todayPlan}
                report={report}
                onGeneratePlan={handleGeneratePlan}
                generating={generating}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No report yet</p>
                  <p className="text-muted-foreground mb-4">Generate an end-of-day report first.</p>
                  <Button onClick={handleEndOfDayReport} disabled={reportLoading}>
                    {reportLoading ? 'Generating...' : '📊 Generate Report'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* PLAN (TOMORROW) VIEW */}
        {viewMode === 'plan' && (
          <div className="space-y-4">
            {tomorrowPlan ? (
              <>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        Tomorrow's Plan — {new Date(tomorrow).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </CardTitle>
                      <Badge className={
                        tomorrowPlan.status === 'finalized' ? 'bg-green-100 text-green-800' :
                        tomorrowPlan.status === 'materialized' ? 'bg-purple-100 text-purple-800' :
                        tomorrowPlan.status === 'teacher_edited' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {tomorrowPlan.status === 'ai_generated' ? '🤖 AI Generated' :
                         tomorrowPlan.status === 'teacher_edited' ? '✏️ Manual' :
                         tomorrowPlan.status === 'finalized' ? '✅ Finalized' :
                         tomorrowPlan.status === 'materialized' ? '📦 Materialized' :
                         tomorrowPlan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {tomorrowItems.length > 0 ? (
                  tomorrowItems.map((item) => (
                    <PlanItemCard
                      key={item.id}
                      item={item}
                      expanded={expandedItems.has(item.id)}
                      onToggle={() => toggleExpand(item.id)}
                    />
                  ))
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Info className="w-8 h-8 mx-auto mb-2" />
                      <p>No plan items found. Try regenerating or creating a manual plan.</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex gap-2">
                  {(tomorrowPlan.status === 'ai_generated' || tomorrowPlan.status === 'teacher_edited') && (
                    <Button onClick={handleFinalizePlan} variant="outline" className="flex-1">
                      ✅ Finalize Plan
                    </Button>
                  )}
                  {(tomorrowPlan.status === 'finalized' || tomorrowPlan.status === 'ai_generated' || tomorrowPlan.status === 'teacher_edited') && !tomorrowPlan.materialized && (
                    <Button onClick={handleMaterialize} disabled={materializing} className="flex-1">
                      {materializing ? 'Creating entries...' : '📦 Materialize → Create Classwork/HW'}
                    </Button>
                  )}
                  <Button onClick={handleGeneratePlan} disabled={generating} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {generating ? 'Generating...' : 'Regenerate'}
                  </Button>
                  <Button onClick={handleDeletePlan} variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* No plan yet — show options */}
                {!showManualForm ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">No plan for tomorrow yet</p>
                      <p className="text-muted-foreground mb-6 text-center max-w-md">
                        Let AI analyze today's work and generate an optimized plan, or create one yourself.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                        <Button onClick={handleGeneratePlan} disabled={generating} size="lg" className="flex-1">
                          {generating ? (
                            <><LoadingSpinner /> Generating...</>
                          ) : (
                            <><Brain className="w-4 h-4 mr-2" /> AI Generate Plan</>
                          )}
                        </Button>
                        <Button
                          onClick={() => setShowManualForm(true)}
                          variant="outline"
                          size="lg"
                          className="flex-1"
                        >
                          <PenLine className="w-4 h-4 mr-2" />
                          Write Manually
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Manual Plan Form */
                  <ManualPlanForm
                    subjects={subjects}
                    items={manualItems}
                    onUpdateItem={updateManualItem}
                    onAddItem={addManualItem}
                    onRemoveItem={removeManualItem}
                    onSave={handleSaveManualPlan}
                    onCancel={() => { setShowManualForm(false); setManualItems([emptyItem()]); }}
                    saving={savingManual}
                    tomorrow={tomorrow}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageAnimation>
  );
}

// ─── Manual Plan Form ────────────────────────────────────────

function ManualPlanForm({
  subjects,
  items,
  onUpdateItem,
  onAddItem,
  onRemoveItem,
  onSave,
  onCancel,
  saving,
  tomorrow,
}: {
  subjects: any[];
  items: ManualPlanItem[];
  onUpdateItem: (key: string, field: keyof ManualPlanItem, value: string) => void;
  onAddItem: () => void;
  onRemoveItem: (key: string) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  tomorrow: string;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenLine className="w-5 h-5" />
              Manual Plan — {new Date(tomorrow).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </CardTitle>
            <Badge className="bg-indigo-100 text-indigo-800">✏️ Manual</Badge>
          </div>
          <CardDescription>Add subjects and fill in what you plan to teach</CardDescription>
        </CardHeader>
      </Card>

      {items.map((item, idx) => (
        <Card key={item.key} className="border-l-4 border-l-indigo-300">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">Subject {idx + 1}</span>
              {items.length > 1 && (
                <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700" onClick={() => onRemoveItem(item.key)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Subject</Label>
                <Select value={item.subjectId} onValueChange={(v) => onUpdateItem(item.key, 'subjectId', v)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Chapter / Topic</Label>
                <Input
                  value={item.chapterName}
                  onChange={(e) => onUpdateItem(item.key, 'chapterName', e.target.value)}
                  placeholder="e.g. Ch-4: The Water Cycle"
                  className="h-9"
                />
              </div>
            </div>

            {/* Oral Work */}
            <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-blue-800">
                <Mic className="w-3.5 h-3.5" /> Oral Work
              </div>
              <Input
                value={item.oralWork}
                onChange={(e) => onUpdateItem(item.key, 'oralWork', e.target.value)}
                placeholder="e.g. Reading aloud, Q&A discussion"
                className="h-8 text-sm bg-white"
              />
              <Textarea
                value={item.oralDetails}
                onChange={(e) => onUpdateItem(item.key, 'oralDetails', e.target.value)}
                placeholder="Detailed instructions (optional)"
                className="min-h-[50px] text-sm bg-white"
              />
            </div>

            {/* Writing Work */}
            <div className="p-3 rounded-lg bg-purple-50/50 border border-purple-100 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-purple-800">
                <Pencil className="w-3.5 h-3.5" /> Writing Work
              </div>
              <Input
                value={item.writingWork}
                onChange={(e) => onUpdateItem(item.key, 'writingWork', e.target.value)}
                placeholder="e.g. Notebook exercises page 45-46"
                className="h-8 text-sm bg-white"
              />
              <Textarea
                value={item.writingDetails}
                onChange={(e) => onUpdateItem(item.key, 'writingDetails', e.target.value)}
                placeholder="Detailed instructions (optional)"
                className="min-h-[50px] text-sm bg-white"
              />
            </div>

            {/* Homework (optional) */}
            <div className="p-3 rounded-lg bg-green-50/50 border border-green-100 space-y-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-green-800">
                <FileText className="w-3.5 h-3.5" /> Homework (optional)
              </div>
              <Input
                value={item.homeworkTitle}
                onChange={(e) => onUpdateItem(item.key, 'homeworkTitle', e.target.value)}
                placeholder="Homework title"
                className="h-8 text-sm bg-white"
              />
              <Textarea
                value={item.homeworkDescription}
                onChange={(e) => onUpdateItem(item.key, 'homeworkDescription', e.target.value)}
                placeholder="Description (optional)"
                className="min-h-[50px] text-sm bg-white"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Add subject button */}
      <Button variant="outline" onClick={onAddItem} className="w-full border-dashed">
        <Plus className="w-4 h-4 mr-2" /> Add Another Subject
      </Button>

      {/* Action buttons */}
      <div className="flex gap-2 sticky bottom-0 bg-background pt-3 pb-2 border-t">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving} className="flex-1">
          {saving ? (
            <><LoadingSpinner /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Plan</>
          )}
        </Button>
      </div>
    </div>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function PlanItemCard({
  item,
  classwork,
  expanded,
  onToggle,
  showUpload,
  onPhotoUploaded,
}: {
  item: NextDayPlanItemType;
  classwork?: any[];
  expanded: boolean;
  onToggle: () => void;
  showUpload?: boolean;
  onPhotoUploaded?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const oralClasswork = classwork?.find((c: any) => c.workType === 'oral');
  const writingClasswork = classwork?.find((c: any) => c.workType === 'writing');
  const totalPhotos = (oralClasswork?.attachments?.length || 0) + (writingClasswork?.attachments?.length || 0);
  const hasOralDone = oralClasswork?.attachments?.length > 0;
  const hasWritingDone = writingClasswork?.attachments?.length > 0;

  async function handlePhotoUpload(workType: 'oral' | 'writing', e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const cw = workType === 'oral' ? oralClasswork : writingClasswork;
    if (!cw) {
      toast.error(`No ${workType} classwork entry found. Materialize the plan first.`);
      return;
    }

    try {
      setUploading(true);

      // Read as base64 for AI validation
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPhotoBase64(base64);
      };
      reader.readAsDataURL(file);

      // Upload to storage
      const filePath = `classwork/${cw.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('File')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      // Create file record linked to classwork
      await fileTableService.createFile({
        fileName: file.name,
        filePath,
        fileType: file.type,
        classworkId: cw.id,
        uploadedBy: 'teacher',
      });

      toast.success('Photo uploaded!');
      onPhotoUploaded?.();
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Card className={item.carryForward ? 'border-amber-200' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between cursor-pointer" onClick={onToggle}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{item.subject?.name || 'Subject'}</p>
              {item.chapterName && (
                <p className="text-sm text-muted-foreground">{item.chapterName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showUpload && totalPhotos > 0 && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                📷 {totalPhotos}
              </Badge>
            )}
            {item.carryForward && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                ⚠️ Carry Forward
              </Badge>
            )}
            {item.subjectScore != null && (
              <Badge className={
                item.subjectScore >= 80 ? 'bg-green-100 text-green-800' :
                item.subjectScore >= 50 ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800'
              }>
                {item.subjectScore}%
              </Badge>
            )}
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {expanded && (
          <div className="mt-4 space-y-3">
            {/* Oral Work */}
            {item.oralWork && (
              <div className="p-2 rounded bg-blue-50">
                <div className="flex items-start gap-2">
                  <Mic className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-blue-900">Oral: {item.oralWork}</p>
                    {item.oralDetails && (
                      <p className="text-xs text-blue-700 mt-1">{item.oralDetails}</p>
                    )}
                    {showUpload && (
                      <div className="mt-2 flex items-center gap-2">
                        {hasOralDone ? (
                          <span className="text-xs text-green-600">✅ {oralClasswork.attachments.length} photo(s)</span>
                        ) : (
                          <span className="text-xs text-gray-400">No photos yet</span>
                        )}
                        {oralClasswork && (
                          <label className="inline-flex items-center gap-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded cursor-pointer transition-colors">
                            <Camera className="w-3 h-3" />
                            {uploading ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload('oral', e)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Writing Work */}
            {item.writingWork && (
              <div className="p-2 rounded bg-purple-50">
                <div className="flex items-start gap-2">
                  <Pencil className="w-4 h-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-900">Writing: {item.writingWork}</p>
                    {item.writingDetails && (
                      <p className="text-xs text-purple-700 mt-1">{item.writingDetails}</p>
                    )}
                    {showUpload && (
                      <div className="mt-2 flex items-center gap-2">
                        {hasWritingDone ? (
                          <span className="text-xs text-green-600">✅ {writingClasswork.attachments.length} photo(s)</span>
                        ) : (
                          <span className="text-xs text-gray-400">No photos yet</span>
                        )}
                        {writingClasswork && (
                          <label className="inline-flex items-center gap-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded cursor-pointer transition-colors">
                            <Camera className="w-3 h-3" />
                            {uploading ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={(e) => handlePhotoUpload('writing', e)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Photo Validation - show after upload */}
            {showUpload && photoBase64 && (
              <AiPhotoValidator
                imageBase64={photoBase64}
                planned={{
                  plannedTitle: item.subject?.name || '',
                  plannedDescription: `${item.oralWork || ''} / ${item.writingWork || ''}`,
                  plannedWorkType: 'classwork',
                  plannedChapter: item.chapterName || '',
                }}
                className="mt-2"
              />
            )}

            {/* Homework */}
            {item.homeworkTitle && (
              <div className="flex items-start gap-2 p-2 rounded bg-green-50">
                <FileText className="w-4 h-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-green-900">HW: {item.homeworkTitle}</p>
                  {item.homeworkDescription && (
                    <p className="text-xs text-green-700 mt-1">{item.homeworkDescription}</p>
                  )}
                  {item.homeworkDueDate && (
                    <p className="text-xs text-green-600 mt-1">Due: {item.homeworkDueDate}</p>
                  )}
                </div>
              </div>
            )}

            {/* AI Rationale */}
            {item.aiRationale && (
              <div className="flex items-start gap-2 p-2 rounded bg-gray-50 text-xs text-muted-foreground">
                <Info className="w-3 h-3 mt-0.5" />
                <p>{item.aiRationale}</p>
              </div>
            )}

            {/* Carry forward reason */}
            {item.carryForward && item.carryForwardReason && (
              <div className="flex items-start gap-2 p-2 rounded bg-amber-50 text-xs text-amber-800">
                <AlertTriangle className="w-3 h-3 mt-0.5" />
                <p>{item.carryForwardReason}</p>
              </div>
            )}

            {/* Subject feedback */}
            {item.subjectFeedback && (
              <div className="flex items-start gap-2 p-2 rounded bg-gray-50 text-xs">
                <CheckCircle className="w-3 h-3 mt-0.5 text-green-600" />
                <p>{item.subjectFeedback}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EndOfDayReportView({
  plan,
  report,
  onGeneratePlan,
  generating,
}: {
  plan: NextDayPlanType | null;
  report: any;
  onGeneratePlan: () => void;
  generating: boolean;
}) {
  const dayScore = report?.dayScore ?? plan?.dayScore ?? 0;
  const feedback = report?.feedback ?? plan?.dayFeedback ?? '';
  const improvements = report?.improvements ?? plan?.improvements ?? [];
  const perSubjectScores = report?.perSubjectScores ?? [];

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📊 End of Day Report
          </CardTitle>
          <CardDescription>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <div className="text-4xl font-bold mb-1">
              {dayScore}/100
            </div>
            <Progress
              value={dayScore}
              className="h-3 max-w-xs mx-auto"
            />
          </div>
          {feedback && (
            <p className="text-center text-muted-foreground">{feedback}</p>
          )}
        </CardContent>
      </Card>

      {/* Per-Subject Scores */}
      {perSubjectScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {perSubjectScores.map((s: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{s.subjectName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {s.oralDone ? '✅' : '❌'} Oral
                        {' '}{s.writingDone ? '✅' : '❌'} Writing
                        {' '}{s.photosUploaded ? '📷' : ''}
                      </span>
                      <Badge className={
                        s.score >= 80 ? 'bg-green-100 text-green-800' :
                        s.score >= 50 ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {s.score}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={s.score} className="h-1.5" />
                  {s.feedback && (
                    <p className="text-xs text-muted-foreground mt-1">{s.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Improvements */}
      {improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              💡 Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {improvements.map((imp: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Generate Tomorrow's Plan */}
      <Button onClick={onGeneratePlan} disabled={generating} size="lg" className="w-full">
        {generating ? (
          <><LoadingSpinner /> Generating Tomorrow's Plan...</>
        ) : (
          <>🤖 Generate Tomorrow's Plan</>
        )}
      </Button>
    </div>
  );
}
