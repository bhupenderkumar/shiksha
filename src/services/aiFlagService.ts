import { supabase } from '@/lib/api-client';
import { SCHEMA, AI_FLAG_TABLE } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────

export type AiFlagType =
  | 'behind_schedule'
  | 'ahead_of_schedule'
  | 'gap_detected'
  | 'festival_upcoming'
  | 'improvement_needed'
  | 'revision_suggested'
  | 'balance_alert'
  | 'content_mismatch'
  | 'errors_in_work'
  | 'incomplete_work';

export type AiFlagSeverity = 'info' | 'warning' | 'critical';

export interface AiFlagRecord {
  id: string;
  classId: string;
  planId: string | null;
  subjectId: string | null;
  syllabusItemId: string | null;
  flagType: AiFlagType;
  severity: AiFlagSeverity;
  message: string;
  suggestedAction: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
}

export interface CreateAiFlagData {
  classId: string;
  planId?: string;
  subjectId?: string;
  syllabusItemId?: string;
  flagType: AiFlagType;
  severity?: AiFlagSeverity;
  message: string;
  suggestedAction?: string;
}

// ─── Service ─────────────────────────────────────────────────

export const aiFlagService = {
  async getByClass(classId: string, includeResolved = false) {
    let query = supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .select('*')
      .eq('classId', classId)
      .order('createdAt', { ascending: false });

    if (!includeResolved) {
      query = query.eq('isResolved', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AiFlagRecord[];
  },

  async getByPlan(planId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .select('*')
      .eq('planId', planId)
      .order('severity', { ascending: true });

    if (error) throw error;
    return data as AiFlagRecord[];
  },

  async create(flag: CreateAiFlagData) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .insert({
        ...flag,
        severity: flag.severity || 'info',
        isResolved: false,
        createdAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as AiFlagRecord;
  },

  async createBulk(flags: CreateAiFlagData[]) {
    if (flags.length === 0) return [];

    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .insert(
        flags.map(flag => ({
          ...flag,
          severity: flag.severity || 'info',
          isResolved: false,
          createdAt: new Date().toISOString(),
        }))
      )
      .select();

    if (error) throw error;
    return data as AiFlagRecord[];
  },

  async resolve(id: string, userId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .update({
        isResolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as AiFlagRecord;
  },

  async resolveByPlan(planId: string, userId: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(AI_FLAG_TABLE)
      .update({
        isResolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: userId,
      })
      .eq('planId', planId)
      .eq('isResolved', false);

    if (error) throw error;
  },
};
