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

// Extract HH:MM from a timestamp string like "1970-01-01T08:30:00" or "08:30"
function formatTime(t: string): string {
  if (!t) return '';
  // If it's already HH:MM format
  if (/^\d{2}:\d{2}$/.test(t)) return t;
  // Try to parse as timestamp
  const match = t.match(/(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]}` : t;
}

// Convert HH:MM to timestamp for DB storage
function toTimestamp(time: string): string {
  return `1970-01-01 ${time}:00`;
}

export const timetableService = {
  getDayName(day: number) {
    return DAY_NAMES[day] || '';
  },

  // Normalize time fields from timestamp to HH:MM
  normalizeEntry(entry: any): TimetableEntry {
    return {
      ...entry,
      startTime: formatTime(entry.startTime),
      endTime: formatTime(entry.endTime),
    };
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
    return (data || []).map(this.normalizeEntry) as TimetableEntry[];
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
    return (data || []).map(this.normalizeEntry) as TimetableEntry[];
  },

  async create(entry: CreateTimetableEntry) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .insert({
        ...entry,
        startTime: toTimestamp(entry.startTime),
        endTime: toTimestamp(entry.endTime),
        createdAt: now,
        updatedAt: now,
      })
      .select(`*, subject:Subject(id, name, code)`)
      .single();

    if (error) throw error;
    return this.normalizeEntry(data) as TimetableEntry;
  },

  async update(id: string, entry: Partial<CreateTimetableEntry>) {
    const updateData: any = { ...entry, updatedAt: new Date().toISOString() };
    if (entry.startTime) updateData.startTime = toTimestamp(entry.startTime);
    if (entry.endTime) updateData.endTime = toTimestamp(entry.endTime);
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(TIMETABLE_TABLE)
      .update(updateData)
      .eq('id', id)
      .select(`*, subject:Subject(id, name, code)`)
      .single();

    if (error) throw error;
    return this.normalizeEntry(data) as TimetableEntry;
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
      .insert(entries.map(e => ({
        ...e,
        startTime: toTimestamp(e.startTime),
        endTime: toTimestamp(e.endTime),
        createdAt: now,
        updatedAt: now,
      })))
      .select(`*, subject:Subject(id, name, code)`);

    if (error) throw error;
    return (data || []).map(this.normalizeEntry) as TimetableEntry[];
  },
};
