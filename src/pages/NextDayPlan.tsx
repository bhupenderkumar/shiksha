import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BookOpen, Mic, Pencil, Camera, CheckCircle, AlertTriangle,
  Clock, ArrowRight, Brain, FileText, Flag, ChevronDown, ChevronUp,
  Sparkles, AlertCircle, Info, RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PageAnimation } from '@/components/ui/page-animation';
import { nextDayPlanService, type NextDayPlanType, type NextDayPlanItemType } from '@/services/nextDayPlanService';
import { aiFlagService, type AiFlagRecord } from '@/services/aiFlagService';
import { aiService } from '@/services/aiService';
import { useAuth } from '@/lib/auth-provider';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

type ViewMode = 'today' | 'report' | 'plan';

export default function NextDayPlan() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [materializing, setMaterializing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('today');

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
    if (selectedClass) loadPlanData();
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

  async function loadPlanData() {
    try {
      setLoading(true);

      const [todayPlanData, tomorrowPlanData, classworkData, flagsData] = await Promise.all([
        nextDayPlanService.getByClassAndDate(selectedClass, today),
        nextDayPlanService.getByClassAndDate(selectedClass, tomorrow),
        supabase
          .schema(SCHEMA)
          .from('Classwork')
          .select('*, attachments:File(*)')
          .eq('classId', selectedClass)
          .eq('date', today),
        aiFlagService.getByClass(selectedClass),
      ]);

      setTodayPlan(todayPlanData);
      setTomorrowPlan(tomorrowPlanData);
      setTodayClasswork(classworkData.data || []);
      setFlags(flagsData);

      if (todayPlanData) {
        const items = await nextDayPlanService.getItems(todayPlanData.id);
        setTodayItems(items);
      }

      if (tomorrowPlanData) {
        const items = await nextDayPlanService.getItems(tomorrowPlanData.id);
        setTomorrowItems(items);
      }
    } catch {
      toast.error('Failed to load plan data');
    } finally {
      setLoading(false);
    }
  }

  async function handleGeneratePlan() {
    if (!selectedClass) return;
    try {
      setGenerating(true);
      await aiService.generateNextDayPlan(selectedClass, tomorrow, user?.id);
      toast.success("Tomorrow's plan generated!");
      await loadPlanData();
      setViewMode('plan');
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate plan');
    } finally {
      setGenerating(false);
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

  function toggleExpand(id: string) {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

                {/* Plan items */}
                {todayItems.map((item) => (
                  <PlanItemCard
                    key={item.id}
                    item={item}
                    classwork={todayClasswork.filter((c: any) => c.sourcePlanItemId === item.id)}
                    expanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                    showUpload
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
                  <p className="text-muted-foreground mb-4">Generate a plan or manually create classwork entries.</p>
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
                items={todayItems}
                report={report}
                onGeneratePlan={handleGeneratePlan}
                generating={generating}
              />
            ) : report ? (
              <EndOfDayReportView
                plan={todayPlan}
                items={todayItems}
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
                        'bg-blue-100 text-blue-800'
                      }>
                        {tomorrowPlan.status === 'ai_generated' ? '🤖 AI Generated' :
                         tomorrowPlan.status === 'finalized' ? '✅ Finalized' :
                         tomorrowPlan.status === 'materialized' ? '📦 Materialized' :
                         tomorrowPlan.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>

                {tomorrowItems.map((item) => (
                  <PlanItemCard
                    key={item.id}
                    item={item}
                    expanded={expandedItems.has(item.id)}
                    onToggle={() => toggleExpand(item.id)}
                  />
                ))}

                <div className="flex gap-2">
                  {tomorrowPlan.status === 'ai_generated' && (
                    <Button onClick={handleFinalizePlan} variant="outline" className="flex-1">
                      ✅ Finalize Plan
                    </Button>
                  )}
                  {(tomorrowPlan.status === 'finalized' || tomorrowPlan.status === 'ai_generated') && !tomorrowPlan.materialized && (
                    <Button onClick={handleMaterialize} disabled={materializing} className="flex-1">
                      {materializing ? 'Creating entries...' : '📦 Materialize → Create Classwork/HW'}
                    </Button>
                  )}
                  <Button onClick={handleGeneratePlan} disabled={generating} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-1" />
                    {generating ? 'Generating...' : 'Regenerate'}
                  </Button>
                </div>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No plan for tomorrow yet</p>
                  <p className="text-muted-foreground mb-4">
                    AI will analyze today's work and generate an optimized plan.
                  </p>
                  <Button onClick={handleGeneratePlan} disabled={generating} size="lg">
                    {generating ? (
                      <><LoadingSpinner /> Generating Plan...</>
                    ) : (
                      <>🤖 Generate Tomorrow's Plan</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </PageAnimation>
  );
}

// ─── Sub-Components ──────────────────────────────────────────

function PlanItemCard({
  item,
  classwork,
  expanded,
  onToggle,
  showUpload,
}: {
  item: NextDayPlanItemType;
  classwork?: any[];
  expanded: boolean;
  onToggle: () => void;
  showUpload?: boolean;
}) {
  const oralClasswork = classwork?.find((c: any) => c.workType === 'oral');
  const writingClasswork = classwork?.find((c: any) => c.workType === 'writing');

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
              <div className="flex items-start gap-2 p-2 rounded bg-blue-50">
                <Mic className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-blue-900">Oral: {item.oralWork}</p>
                  {item.oralDetails && (
                    <p className="text-xs text-blue-700 mt-1">{item.oralDetails}</p>
                  )}
                  {showUpload && oralClasswork && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {oralClasswork.attachments?.length > 0 ? (
                        <span className="text-green-600">✅ {oralClasswork.attachments.length} photo(s)</span>
                      ) : (
                        <span className="text-gray-400">No photos uploaded</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Writing Work */}
            {item.writingWork && (
              <div className="flex items-start gap-2 p-2 rounded bg-purple-50">
                <Pencil className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm text-purple-900">Writing: {item.writingWork}</p>
                  {item.writingDetails && (
                    <p className="text-xs text-purple-700 mt-1">{item.writingDetails}</p>
                  )}
                  {showUpload && writingClasswork && (
                    <div className="mt-1 flex items-center gap-1 text-xs">
                      {writingClasswork.attachments?.length > 0 ? (
                        <span className="text-green-600">✅ {writingClasswork.attachments.length} photo(s)</span>
                      ) : (
                        <span className="text-gray-400">No photos uploaded</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
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
  items,
  report,
  onGeneratePlan,
  generating,
}: {
  plan: NextDayPlanType | null;
  items: NextDayPlanItemType[];
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
