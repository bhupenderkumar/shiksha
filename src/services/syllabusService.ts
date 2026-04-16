import { supabase } from '@/lib/api-client';
import { SCHEMA, SYLLABUS_TABLE, SYLLABUS_ITEM_TABLE, SYLLABUS_PROGRESS_TABLE } from '@/lib/constants';

// ─── Types ───────────────────────────────────────────────────

export interface SyllabusType {
  id: string;
  classId: string;
  subjectId: string;
  academicYear: string;
  title: string;
  description: string | null;
  status: 'draft' | 'approved' | 'archived';
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  class?: { id: string; name: string; section: string };
  subject?: { id: string; name: string; code: string };
  items?: SyllabusItemType[];
}

export interface SyllabusItemType {
  id: string;
  syllabusId: string;
  chapterNumber: number;
  title: string;
  description: string | null;
  learningObjectives: string[] | null;
  estimatedDays: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  progress?: SyllabusProgressType;
}

export interface SyllabusProgressType {
  id: string;
  syllabusItemId: string;
  classId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedDate: string | null;
  completedDate: string | null;
  actualDays: number | null;
  notes: string | null;
  updatedBy: string | null;
  updatedAt: string;
}

export interface CreateSyllabusData {
  classId: string;
  subjectId: string;
  academicYear: string;
  title: string;
  description?: string;
}

export interface CreateSyllabusItemData {
  syllabusId: string;
  chapterNumber: number;
  title: string;
  description?: string;
  learningObjectives?: string[];
  estimatedDays?: number;
  sortOrder?: number;
}

// ─── Service ─────────────────────────────────────────────────

export const syllabusService = {
  async getAll(classId?: string) {
    let query = supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name, code)
      `)
      .order('createdAt', { ascending: false });

    if (classId) {
      query = query.eq('classId', classId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as SyllabusType[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name, code)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as SyllabusType;
  },

  async getByClassAndSubject(classId: string, subjectId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .select(`
        *,
        class:Class(id, name, section),
        subject:Subject(id, name, code)
      `)
      .eq('classId', classId)
      .eq('subjectId', subjectId)
      .eq('status', 'approved')
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data as SyllabusType | null;
  },

  async create(data: CreateSyllabusData) {
    const { data: syllabus, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .insert({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return syllabus as SyllabusType;
  },

  async update(id: string, data: Partial<CreateSyllabusData> & { status?: string; approvedBy?: string; approvedAt?: string }) {
    const { data: syllabus, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return syllabus as SyllabusType;
  },

  async delete(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async approve(id: string, userId: string) {
    return this.update(id, {
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
    });
  },

  // ─── Syllabus Items ─────────────────────────────────────────

  async getItems(syllabusId: string, classId?: string) {
    const { data: items, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_ITEM_TABLE)
      .select('*')
      .eq('syllabusId', syllabusId)
      .order('sortOrder', { ascending: true });

    if (error) throw error;

    if (!classId) return items as SyllabusItemType[];

    // Fetch progress for each item
    const itemIds = items.map((i: any) => i.id);
    const { data: progressData, error: progressError } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_PROGRESS_TABLE)
      .select('*')
      .in('syllabusItemId', itemIds)
      .eq('classId', classId);

    if (progressError) throw progressError;

    const progressMap = new Map((progressData || []).map((p: any) => [p.syllabusItemId, p]));

    return items.map((item: any) => ({
      ...item,
      progress: progressMap.get(item.id) || null,
    })) as SyllabusItemType[];
  },

  async createItem(data: CreateSyllabusItemData) {
    const { data: item, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_ITEM_TABLE)
      .insert({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return item as SyllabusItemType;
  },

  async createItemsBulk(items: CreateSyllabusItemData[]) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_ITEM_TABLE)
      .insert(
        items.map((item, index) => ({
          ...item,
          sortOrder: item.sortOrder ?? index,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      )
      .select();

    if (error) throw error;
    return data as SyllabusItemType[];
  },

  async updateItem(id: string, data: Partial<CreateSyllabusItemData>) {
    const { data: item, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_ITEM_TABLE)
      .update({ ...data, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return item as SyllabusItemType;
  },

  async deleteItem(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_ITEM_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ─── Syllabus Progress ──────────────────────────────────────

  async getProgressByClass(classId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_PROGRESS_TABLE)
      .select(`
        *,
        syllabusItem:SyllabusItem(
          id, title, chapterNumber, syllabusId,
          syllabus:Syllabus(id, subjectId, classId, subject:Subject(id, name))
        )
      `)
      .eq('classId', classId);

    if (error) throw error;
    return data as any[];
  },

  async markProgress(
    syllabusItemId: string,
    classId: string,
    status: 'not_started' | 'in_progress' | 'completed' | 'skipped',
    userId?: string,
    notes?: string
  ) {
    const now = new Date().toISOString();
    const updateData: Record<string, unknown> = {
      syllabusItemId,
      classId,
      status,
      updatedBy: userId || null,
      updatedAt: now,
      notes: notes || null,
    };

    if (status === 'in_progress') {
      updateData.startedDate = new Date().toISOString().split('T')[0];
    } else if (status === 'completed') {
      updateData.completedDate = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(SYLLABUS_PROGRESS_TABLE)
      .upsert(updateData, { onConflict: 'syllabusItemId,classId' })
      .select()
      .single();

    if (error) throw error;
    return data as SyllabusProgressType;
  },

  async getItemsForSubject(classId: string, subjectId: string) {
    // First find the approved syllabus for this class+subject
    const syllabus = await this.getByClassAndSubject(classId, subjectId);
    if (!syllabus) return [];
    return this.getItems(syllabus.id, classId);
  },
};
