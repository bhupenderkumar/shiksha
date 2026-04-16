import { llm } from './llmProvider';
import { syllabusService } from './syllabusService';
import { nextDayPlanService, type CreatePlanItemData } from './nextDayPlanService';
import { aiFlagService, type CreateAiFlagData } from './aiFlagService';
import { calendarService } from './calendarService';
import { supabase } from '@/lib/api-client';
import { SCHEMA, CLASSWORK_TABLE, HOMEWORK_TABLE, TIMETABLE_TABLE } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────

export interface PhotoValidation {
  matchScore: number;
  matchStatus: 'full_match' | 'partial' | 'mismatch' | 'unreadable';
  whatPhotoShows: string;
  whatWasPlanned: string;
  deviationNotes: string;
  qualityNotes: string;
  topicsCovered: string[];
  errorsSpotted: string[];
  syllabusAlignment: string;
  suggestedFollowUp: string;
}

interface EndOfDayReport {
  dayScore: number;
  feedback: string;
  perSubjectScores: Array<{
    planItemId: string;
    subjectName: string;
    score: number;
    feedback: string;
    oralDone: boolean;
    writingDone: boolean;
    photosUploaded: boolean;
  }>;
  improvements: string[];
  carryForwardItems: string[];
  completedChapters: Array<{
    syllabusItemId: string;
    subjectName: string;
    chapterName: string;
  }>;
}

interface PlanGenerationResult {
  planItems: Array<{
    subjectName: string;
    subjectId: string;
    syllabusItemId: string;
    chapterName: string;
    oralWork: string;
    oralDetails: string;
    writingWork: string;
    writingDetails: string;
    homeworkTitle?: string;
    homeworkDescription?: string;
    aiRationale: string;
    carryForward?: boolean;
    carryForwardReason?: string;
  }>;
  flags: Array<{
    flagType: string;
    severity: string;
    subjectName?: string;
    subjectId?: string;
    syllabusItemId?: string;
    message: string;
    suggestedAction: string;
  }>;
  improvements: string[];
  overallNotes: string;
}

// ─── Prompts ─────────────────────────────────────────────────

const END_OF_DAY_PROMPT = `You are an AI teaching assistant analyzing a school day.

You are given:
- The PLAN for today (what was supposed to happen per subject)
- The ACTUAL classwork entries (what was created, which have photos uploaded)
- The ACTUAL homework entries (what was assigned)
- Syllabus progress (overall chapter completion status)

Your job:
1. Score each subject 0-100 based on plan completion
2. Compute overall day score (weighted average)
3. Identify what was NOT done and should carry forward
4. Detect if any chapter was completed today (mark for syllabus update)
5. Generate improvement suggestions
6. Flag any patterns (e.g., writing always skipped for English)

Return JSON:
{
  "dayScore": 73,
  "feedback": "Good day overall summary.",
  "perSubjectScores": [
    {
      "planItemId": "...",
      "subjectName": "Hindi",
      "score": 100,
      "feedback": "Well done.",
      "oralDone": true,
      "writingDone": true,
      "photosUploaded": true
    }
  ],
  "improvements": ["suggestion1", "suggestion2"],
  "carryForwardItems": ["plan_item_id"],
  "completedChapters": [
    { "syllabusItemId": "...", "subjectName": "Hindi", "chapterName": "Ch-4" }
  ]
}`;

const PHOTO_VALIDATION_PROMPT = `You are an AI teaching assistant validating school work.

You are given:
- An IMAGE of a student's/class's classwork or homework
- What was PLANNED for this entry (title, description, work type, chapter)

Your job:
1. READ the image carefully — identify subject, topic, chapter
2. COUNT specifics — how many problems done, sentences written, pages covered
3. COMPARE to what was planned
4. SCORE the match 0-100
5. NOTE quality issues
6. SPOT specific student errors if visible

Return JSON:
{
  "matchScore": 85,
  "matchStatus": "partial",
  "whatPhotoShows": "description of what the photo actually shows",
  "whatWasPlanned": "description of what was planned",
  "deviationNotes": "any deviations from plan",
  "qualityNotes": "handwriting, neatness, etc.",
  "topicsCovered": ["topic1", "topic2"],
  "errorsSpotted": ["error1", "error2"],
  "syllabusAlignment": "matches/doesn't match expected chapter",
  "suggestedFollowUp": "what to do next"
}

IMPORTANT:
- If the image is blurry or unreadable, return matchStatus='unreadable'
- Be specific about errors
- Count actual items when possible`;

const PLANNING_PROMPT = `You are an AI teaching assistant for an Indian school.
You help teachers plan the next day's classwork based on:
- What was done today (scores and feedback)
- Items carried forward (unfinished work — MUST be included)
- Approved syllabus and current progress
- Tomorrow's timetable (which subjects are scheduled)
- Upcoming festivals and holidays
- Past patterns of oral vs writing work balance

Rules:
1. Every subject period should have BOTH oral and writing components
2. Oral work = reading aloud, recitation, verbal Q&A, discussion
3. Writing work = notebook exercises, copying, worksheets, drawing
4. Follow the syllabus sequence — don't skip chapters
5. If a chapter is behind schedule, suggest ways to catch up
6. If a festival is within 3 days, suggest a relevant activity
7. Consider what students found difficult (from improvement notes)
8. Balance workload — don't overload one subject

Return JSON:
{
  "planItems": [
    {
      "subjectName": "Hindi",
      "subjectId": "...",
      "syllabusItemId": "...",
      "chapterName": "Ch-4: Title",
      "oralWork": "description of oral work",
      "oralDetails": "detailed instructions",
      "writingWork": "description of writing work",
      "writingDetails": "detailed instructions",
      "homeworkTitle": "optional homework title",
      "homeworkDescription": "optional homework description",
      "aiRationale": "why this was suggested",
      "carryForward": false,
      "carryForwardReason": ""
    }
  ],
  "flags": [
    {
      "flagType": "behind_schedule",
      "severity": "warning",
      "subjectName": "Hindi",
      "subjectId": "...",
      "message": "description",
      "suggestedAction": "what to do"
    }
  ],
  "improvements": ["suggestion1"],
  "overallNotes": "summary"
}`;

const SYLLABUS_EXTRACTION_PROMPT = `You are analyzing a school syllabus document for {subject} for {classLevel}.
Extract ALL chapters/topics as a structured list.

Return JSON:
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "chapter title in original language",
      "description": "brief scope description",
      "learningObjectives": ["obj1", "obj2"],
      "estimatedDays": 5
    }
  ],
  "totalChapters": 12,
  "notes": "any relevant notes about the syllabus structure"
}`;

// ─── Helper Functions ────────────────────────────────────────

async function fetchClassworkForDate(classId: string, date: string) {
  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(CLASSWORK_TABLE)
    .select(`
      *,
      attachments:File(*)
    `)
    .eq('classId', classId)
    .eq('date', date);

  if (error) throw error;
  return data || [];
}

async function fetchHomeworkForDate(classId: string, date: string) {
  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(HOMEWORK_TABLE)
    .select(`
      *,
      attachments:File(*)
    `)
    .eq('classId', classId)
    .gte('createdAt', `${date}T00:00:00`)
    .lt('createdAt', `${date}T23:59:59`);

  if (error) throw error;
  return data || [];
}

async function fetchRecentClasswork(classId: string, days = 5) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(CLASSWORK_TABLE)
    .select('*')
    .eq('classId', classId)
    .gte('date', startDate.toISOString().split('T')[0])
    .lte('date', endDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchTimetable(classId: string, dayOfWeek: number) {
  const { data, error } = await supabase
    .schema(SCHEMA)
    .from(TIMETABLE_TABLE)
    .select(`
      *,
      subject:Subject(id, name, code)
    `)
    .eq('classId', classId)
    .eq('day', dayOfWeek)
    .order('startTime', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── Main AI Service ─────────────────────────────────────────

export const aiService = {
  /**
   * Gather all context needed for AI planning
   */
  async gatherPlanningContext(classId: string, targetDate: string) {
    const today = new Date().toISOString().split('T')[0];
    const targetDayOfWeek = new Date(targetDate).getDay();

    const [
      todayClasswork,
      todayHomework,
      syllabusProgress,
      tomorrowTimetable,
      upcomingHolidays,
      recentClasswork,
      activeFlags,
    ] = await Promise.all([
      fetchClassworkForDate(classId, today),
      fetchHomeworkForDate(classId, today),
      syllabusService.getProgressByClass(classId),
      fetchTimetable(classId, targetDayOfWeek),
      calendarService.getUpcomingHolidays(today, 7),
      fetchRecentClasswork(classId, 5),
      aiFlagService.getByClass(classId),
    ]);

    return {
      todayClasswork,
      todayHomework,
      syllabusProgress,
      tomorrowTimetable,
      upcomingHolidays,
      recentClasswork,
      activeFlags,
    };
  },

  /**
   * Generate next day plan using AI
   */
  async generateNextDayPlan(classId: string, targetDate: string, userId?: string) {
    const context = await this.gatherPlanningContext(classId, targetDate);

    const userMessage = JSON.stringify({
      targetDate,
      todayClasswork: context.todayClasswork.map(c => ({
        title: c.title,
        description: c.description,
        workType: c.workType,
        subjectId: c.subjectId,
        chapterName: c.chapterName,
        completionStatus: c.completionStatus,
        hasPhotos: c.attachments?.length > 0,
      })),
      todayHomework: context.todayHomework.map(h => ({
        title: h.title,
        description: h.description,
        subjectId: h.subjectId,
        status: h.status,
      })),
      syllabusProgress: context.syllabusProgress.map(p => ({
        subjectName: p.syllabusItem?.syllabus?.subject?.name,
        subjectId: p.syllabusItem?.syllabus?.subjectId,
        chapterNumber: p.syllabusItem?.chapterNumber,
        chapterTitle: p.syllabusItem?.title,
        syllabusItemId: p.syllabusItem?.id,
        status: p.status,
        actualDays: p.actualDays,
      })),
      tomorrowTimetable: context.tomorrowTimetable.map(t => ({
        subjectId: t.subjectId,
        subjectName: t.subject?.name,
        startTime: t.startTime,
        endTime: t.endTime,
      })),
      upcomingHolidays: context.upcomingHolidays.map(h => ({
        name: h.name,
        date: h.date,
      })),
      recentWorkPatterns: {
        totalClasswork: context.recentClasswork.length,
        oralCount: context.recentClasswork.filter(c => c.workType === 'oral').length,
        writingCount: context.recentClasswork.filter(c => c.workType === 'writing').length,
      },
      activeFlags: context.activeFlags.map(f => ({
        flagType: f.flagType,
        severity: f.severity,
        message: f.message,
      })),
    });

    const response = await llm.complete(PLANNING_PROMPT, userMessage);
    const result = llm.parseJSON<PlanGenerationResult>(response);

    // Save the plan to database
    const planItems: CreatePlanItemData[] = result.planItems.map((item, index) => ({
      planId: '', // Will be set during save
      subjectId: item.subjectId,
      syllabusItemId: item.syllabusItemId || undefined,
      chapterName: item.chapterName,
      oralWork: item.oralWork,
      oralDetails: item.oralDetails,
      writingWork: item.writingWork,
      writingDetails: item.writingDetails,
      homeworkTitle: item.homeworkTitle,
      homeworkDescription: item.homeworkDescription,
      aiRationale: item.aiRationale,
      carryForward: item.carryForward || false,
      carryForwardReason: item.carryForwardReason,
      sortOrder: index,
    }));

    const savedPlan = await nextDayPlanService.savePlan(
      classId,
      targetDate,
      result as unknown as Record<string, unknown>,
      planItems,
      userId
    );

    // Save AI flags
    if (result.flags && result.flags.length > 0) {
      const flagData: CreateAiFlagData[] = result.flags.map(f => ({
        classId,
        planId: savedPlan.id,
        subjectId: f.subjectId,
        syllabusItemId: f.syllabusItemId,
        flagType: f.flagType as CreateAiFlagData['flagType'],
        severity: (f.severity || 'info') as CreateAiFlagData['severity'],
        message: f.message,
        suggestedAction: f.suggestedAction,
      }));
      await aiFlagService.createBulk(flagData);
    }

    return savedPlan;
  },

  /**
   * Materialize a plan — convert NextDayPlanItems into real Classwork/Homework entries
   */
  async materializePlan(planId: string, userId: string) {
    const plan = await nextDayPlanService.getById(planId);
    if (plan.materialized) return plan;

    const planItems = await nextDayPlanService.getItems(planId);

    for (const item of planItems) {
      // Create Oral Classwork entry
      if (item.oralWork) {
        await supabase
          .schema(SCHEMA)
          .from(CLASSWORK_TABLE)
          .insert({
            title: `${item.chapterName || ''} — ${item.oralWork}`.trim(),
            description: item.oralDetails || item.oralWork,
            date: plan.planDate,
            classId: plan.classId,
            workType: 'oral',
            subjectId: item.subjectId,
            syllabusItemId: item.syllabusItemId,
            chapterName: item.chapterName,
            completionStatus: 'planned',
            sourcePlanItemId: item.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
      }

      // Create Writing Classwork entry
      if (item.writingWork) {
        await supabase
          .schema(SCHEMA)
          .from(CLASSWORK_TABLE)
          .insert({
            title: `${item.chapterName || ''} — ${item.writingWork}`.trim(),
            description: item.writingDetails || item.writingWork,
            date: plan.planDate,
            classId: plan.classId,
            workType: 'writing',
            subjectId: item.subjectId,
            syllabusItemId: item.syllabusItemId,
            chapterName: item.chapterName,
            completionStatus: 'planned',
            sourcePlanItemId: item.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
      }

      // Create Homework entry
      if (item.homeworkTitle) {
        const dueDate = item.homeworkDueDate || (() => {
          const d = new Date(plan.planDate);
          d.setDate(d.getDate() + 1);
          return d.toISOString().split('T')[0];
        })();

        await supabase
          .schema(SCHEMA)
          .from(HOMEWORK_TABLE)
          .insert({
            title: item.homeworkTitle,
            description: item.homeworkDescription || item.homeworkTitle,
            dueDate,
            subjectId: item.subjectId,
            classId: plan.classId,
            status: 'PENDING',
            syllabusItemId: item.syllabusItemId,
            chapterName: item.chapterName,
            sourcePlanItemId: item.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
      }
    }

    return nextDayPlanService.markMaterialized(planId);
  },

  /**
   * Generate end-of-day report
   */
  async generateEndOfDayReport(classId: string, date: string): Promise<EndOfDayReport> {
    const plan = await nextDayPlanService.getByClassAndDate(classId, date);
    const planItems = plan ? await nextDayPlanService.getItems(plan.id) : [];
    const todayClasswork = await fetchClassworkForDate(classId, date);
    const todayHomework = await fetchHomeworkForDate(classId, date);
    const syllabusProgress = await syllabusService.getProgressByClass(classId);

    const classworkWithPhotos = todayClasswork.filter((c: any) => c.attachments?.length > 0);
    const classworkWithoutPhotos = todayClasswork.filter((c: any) =>
      c.completionStatus === 'planned' && (!c.attachments || c.attachments.length === 0)
    );

    const context = {
      plannedItems: planItems.map(p => ({
        id: p.id,
        subjectId: p.subjectId,
        subjectName: p.subject?.name,
        chapterName: p.chapterName,
        oralWork: p.oralWork,
        writingWork: p.writingWork,
        homeworkTitle: p.homeworkTitle,
      })),
      actualClasswork: todayClasswork.map((c: any) => ({
        id: c.id,
        title: c.title,
        workType: c.workType,
        subjectId: c.subjectId,
        chapterName: c.chapterName,
        completionStatus: c.completionStatus,
        sourcePlanItemId: c.sourcePlanItemId,
        hasPhotos: c.attachments?.length > 0,
        photoCount: c.attachments?.length || 0,
      })),
      actualHomework: todayHomework.map((h: any) => ({
        title: h.title,
        subjectId: h.subjectId,
        status: h.status,
      })),
      classworkWithPhotos: classworkWithPhotos.length,
      classworkWithoutPhotos: classworkWithoutPhotos.map((c: any) => c.title),
      syllabusProgress: syllabusProgress.map(p => ({
        subjectName: p.syllabusItem?.syllabus?.subject?.name,
        chapterTitle: p.syllabusItem?.title,
        syllabusItemId: p.syllabusItemId,
        status: p.status,
      })),
    };

    const response = await llm.complete(END_OF_DAY_PROMPT, JSON.stringify(context));
    const report = llm.parseJSON<EndOfDayReport>(response);

    // Update plan with scores
    if (plan) {
      await nextDayPlanService.updateDayReport(plan.id, {
        dayScore: report.dayScore,
        dayFeedback: report.feedback,
        improvements: report.improvements,
      });

      // Update per-subject scores
      for (const subjectScore of report.perSubjectScores) {
        if (subjectScore.planItemId) {
          await nextDayPlanService.updateItemScore(subjectScore.planItemId, {
            subjectScore: subjectScore.score,
            subjectFeedback: subjectScore.feedback,
          });
        }
      }

      // Auto-update syllabus progress for completed chapters
      for (const completed of report.completedChapters || []) {
        if (completed.syllabusItemId) {
          await syllabusService.markProgress(completed.syllabusItemId, classId, 'completed');
        }
      }
    }

    return report;
  },

  /**
   * Validate a work photo against the plan
   */
  async validateWorkPhoto(
    imageBase64: string,
    planned: {
      plannedTitle: string;
      plannedDescription: string;
      plannedWorkType: string;
      plannedChapter: string;
    }
  ): Promise<PhotoValidation> {
    const response = await llm.completeWithVision(
      PHOTO_VALIDATION_PROMPT,
      imageBase64,
      JSON.stringify(planned)
    );

    return llm.parseJSON<PhotoValidation>(response);
  },

  /**
   * Extract syllabus chapters from uploaded PDF/image
   */
  async extractSyllabusFromDocument(imageBase64: string, subject: string, classLevel: string) {
    const prompt = SYLLABUS_EXTRACTION_PROMPT
      .replace('{subject}', subject)
      .replace('{classLevel}', classLevel);

    const response = await llm.completeWithVision(prompt, imageBase64, `Extract the syllabus for ${subject} — ${classLevel}`);
    return llm.parseJSON<{
      chapters: Array<{
        chapterNumber: number;
        title: string;
        description: string;
        learningObjectives: string[];
        estimatedDays: number;
      }>;
      totalChapters: number;
      notes: string;
    }>(response);
  },
};
