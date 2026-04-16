import { supabase } from '@/lib/api-client';
import { SCHEMA, NEXT_DAY_PLAN_TABLE, NEXT_DAY_PLAN_ITEM_TABLE } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────

export interface NextDayPlanType {
  id: string;
  classId: string;
  planDate: string;
  generatedAt: string | null;
  editedAt: string | null;
  editedBy: string | null;
  status: 'ai_generated' | 'teacher_edited' | 'finalized' | 'materialized';
  materialized: boolean;
  materializedAt: string | null;
  aiRawResponse: Record<string, unknown> | null;
  dayScore: number | null;
  dayFeedback: string | null;
  improvements: string[] | null;
  createdAt: string;
  updatedAt: string;
  class?: { id: string; name: string; section: string };
  items?: NextDayPlanItemType[];
}

export interface NextDayPlanItemType {
  id: string;
  planId: string;
  subjectId: string;
  syllabusItemId: string | null;
  chapterName: string | null;
  oralWork: string | null;
  oralDetails: string | null;
  writingWork: string | null;
  writingDetails: string | null;
  homeworkTitle: string | null;
  homeworkDescription: string | null;
  homeworkDueDate: string | null;
  aiRationale: string | null;
  teacherNotes: string | null;
  carryForward: boolean;
  carryForwardReason: string | null;
  sortOrder: number;
  subjectScore: number | null;
  subjectFeedback: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string; code: string };
}

export interface CreatePlanData {
  classId: string;
  planDate: string;
  editedBy?: string;
  aiRawResponse?: Record<string, unknown>;
}

export interface CreatePlanItemData {
  planId: string;
  subjectId: string;
  syllabusItemId?: string;
  chapterName?: string;
  oralWork?: string;
  oralDetails?: string;
  writingWork?: string;
  writingDetails?: string;
  homeworkTitle?: string;
  homeworkDescription?: string;
  homeworkDueDate?: string;
  aiRationale?: string;
  teacherNotes?: string;
  carryForward?: boolean;
  carryForwardReason?: string;
  sortOrder?: number;
}

// ─── Service ─────────────────────────────────────────────────

export const nextDayPlanService = {
  async getByClassAndDate(classId: string, planDate: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .select(`
        *,
        class:Class(id, name, section)
      `)
      .eq('classId', classId)
      .eq('planDate', planDate)
      .maybeSingle();

    if (error) throw error;
    return data as NextDayPlanType | null;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .select(`
        *,
        class:Class(id, name, section)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as NextDayPlanType;
  },

  async getRecentPlans(classId: string, limit = 7) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .select(`
        *,
        class:Class(id, name, section)
      `)
      .eq('classId', classId)
      .order('planDate', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as NextDayPlanType[];
  },

  async create(data: CreatePlanData) {
    const now = new Date().toISOString();
    const { data: plan, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .insert({
        ...data,
        generatedAt: now,
        status: 'ai_generated',
        createdAt: now,
        updatedAt: now,
      })
      .select()
      .single();

    if (error) throw error;
    return plan as NextDayPlanType;
  },

  async updateStatus(id: string, status: NextDayPlanType['status'], userId?: string) {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date().toISOString(),
    };

    if (status === 'teacher_edited' && userId) {
      updateData.editedAt = new Date().toISOString();
      updateData.editedBy = userId;
    }

    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NextDayPlanType;
  },

  async markMaterialized(id: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .update({
        materialized: true,
        materializedAt: new Date().toISOString(),
        status: 'materialized',
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NextDayPlanType;
  },

  async updateDayReport(id: string, report: { dayScore: number; dayFeedback: string; improvements: string[] }) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .update({
        dayScore: report.dayScore,
        dayFeedback: report.dayFeedback,
        improvements: report.improvements,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NextDayPlanType;
  },

  async delete(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ─── Plan Items ─────────────────────────────────────────────

  async getItems(planId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_ITEM_TABLE)
      .select(`
        *,
        subject:Subject(id, name, code)
      `)
      .eq('planId', planId)
      .order('sortOrder', { ascending: true });

    if (error) throw error;
    return data as NextDayPlanItemType[];
  },

  async createItems(items: CreatePlanItemData[]) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_ITEM_TABLE)
      .insert(
        items.map((item, index) => ({
          ...item,
          sortOrder: item.sortOrder ?? index,
          createdAt: now,
          updatedAt: now,
        }))
      )
      .select(`
        *,
        subject:Subject(id, name, code)
      `);

    if (error) throw error;
    return data as NextDayPlanItemType[];
  },

  async updateItem(id: string, data: Partial<CreatePlanItemData>) {
    const { data: item, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_ITEM_TABLE)
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return item as NextDayPlanItemType;
  },

  async updateItemScore(id: string, score: { subjectScore: number; subjectFeedback: string }) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_ITEM_TABLE)
      .update({
        subjectScore: score.subjectScore,
        subjectFeedback: score.subjectFeedback,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as NextDayPlanItemType;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(NEXT_DAY_PLAN_ITEM_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Save a full AI-generated plan with its items
   */
  async savePlan(
    classId: string,
    planDate: string,
    aiResponse: Record<string, unknown>,
    items: CreatePlanItemData[],
    userId?: string
  ) {
    // Create the plan
    const plan = await this.create({
      classId,
      planDate,
      editedBy: userId,
      aiRawResponse: aiResponse,
    });

    // Create all items
    const planItems = await this.createItems(
      items.map(item => ({ ...item, planId: plan.id }))
    );

    return { ...plan, items: planItems };
  },
};
