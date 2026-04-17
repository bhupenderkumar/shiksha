import { supabase } from '@/lib/api-client';
import { SCHEMA, TIMETABLE_TABLE } from '@/lib/constants';

export interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  day: number; // 0=Sunday, 6=Saturday
  startTime: string;
  endTime: string;
  periodNumber: number;
  teacherName: string | null;
  room: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: { id: string; name: string; code: string };
  class?: { id: string; name: string; section: string };
}

export interface CreateTimetableEntry {
  classId: string;
  subjectId: string;
  day: number;
  startTime: string;
  endTime: string;
  periodNumber: number;
  teacherName?: string;
  room?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const timetableService = {
  getDayName(day: number) {
    return DAY_NAMES[day] || '';
  },

  async getByClass(classId: string) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .select(`
        *,
        subject:Subject(id, name, code)
      `)
      .eq('classId', classId)
      .order('day')
      .order('periodNumber');

    if (error) throw error;
    return data as TimetableEntry[];
  },

  async getByClassAndDay(classId: string, day: number) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .select(`
        *,
        subject:Subject(id, name, code)
      `)
      .eq('classId', classId)
      .eq('day', day)
      .order('periodNumber');

    if (error) throw error;
    return data as TimetableEntry[];
  },

  async create(entry: CreateTimetableEntry) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .insert({ ...entry, createdAt: now, updatedAt: now })
      .select(`*, subject:Subject(id, name, code)`)
      .single();

    if (error) throw error;
    return data as TimetableEntry;
  },

  async update(id: string, entry: Partial<CreateTimetableEntry>) {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .update({ ...entry, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select(`*, subject:Subject(id, name, code)`)
      .single();

    if (error) throw error;
    return data as TimetableEntry;
  },

  async delete(id: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async deleteByClass(classId: string) {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .delete()
      .eq('classId', classId);

    if (error) throw error;
  },

  async bulkCreate(entries: CreateTimetableEntry[]) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .insert(entries.map(e => ({ ...e, createdAt: now, updatedAt: now })))
      .select(`*, subject:Subject(id, name, code)`);

    if (error) throw error;
    return data as TimetableEntry[];
  },
};
