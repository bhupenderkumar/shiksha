import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

export const MONTHLY_REMARKS_REGISTER_TABLE = 'MonthlyRemarksRegister';
export const MONTHLY_REMARKS_ENTRY_TABLE = 'MonthlyRemarksEntry';

export const REMARKS_CLASS_OPTIONS = [
  'Pre Nursery',
  'Nursery',
  'KG-1',
  'KG-2',
  'Class I',
  'Class II',
];

export const REMARKS_MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
];

export interface MonthlyRemarksRegister {
  id: string;
  class_name: string;
  section: string | null;
  month: string;
  academic_year: string;
  total_present_days: number | null;
  page_label: string | null;
  notes: string | null;
  is_published: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface MonthlyRemarksEntry {
  id: string;
  register_id: string;
  serial_no: number;
  student_name: string;
  roll_no: string | null;
  attendance_days: number | null;
  remarks: string;
  parent_message: string | null;
  student_photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegisterWithEntries extends MonthlyRemarksRegister {
  entries: MonthlyRemarksEntry[];
}

export type RegisterUpsert = Partial<MonthlyRemarksRegister> & {
  class_name: string;
  month: string;
  academic_year: string;
};

export type EntryUpsert = Partial<MonthlyRemarksEntry> & {
  register_id: string;
  student_name: string;
};

export const monthlyRemarksService = {
  // ----- Registers -----
  async listRegisters(filters?: {
    class_name?: string;
    month?: string;
    academic_year?: string;
  }): Promise<MonthlyRemarksRegister[]> {
    let q = supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .select('*')
      .order('academic_year', { ascending: false })
      .order('class_name', { ascending: true })
      .order('month', { ascending: true });

    if (filters?.class_name) q = q.eq('class_name', filters.class_name);
    if (filters?.month) q = q.eq('month', filters.month);
    if (filters?.academic_year) q = q.eq('academic_year', filters.academic_year);

    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as MonthlyRemarksRegister[];
  },

  async getRegisterById(id: string): Promise<MonthlyRemarksRegister | null> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as MonthlyRemarksRegister | null;
  },

  async getRegisterByLookup(
    class_name: string,
    month: string,
    academic_year: string
  ): Promise<MonthlyRemarksRegister | null> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .select('*')
      .eq('class_name', class_name)
      .eq('month', month)
      .eq('academic_year', academic_year)
      .maybeSingle();
    if (error) throw error;
    return data as MonthlyRemarksRegister | null;
  },

  async getRegisterByToken(token: string): Promise<RegisterWithEntries | null> {
    const { data: reg, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .select('*')
      .eq('share_token', token)
      .maybeSingle();
    if (error) throw error;
    if (!reg) return null;
    const entries = await this.listEntries((reg as any).id);
    return { ...(reg as MonthlyRemarksRegister), entries };
  },

  async getRegisterWithEntries(id: string): Promise<RegisterWithEntries | null> {
    const reg = await this.getRegisterById(id);
    if (!reg) return null;
    const entries = await this.listEntries(reg.id);
    return { ...reg, entries };
  },

  async createRegister(data: RegisterUpsert): Promise<MonthlyRemarksRegister> {
    const { data: result, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .insert([data as any])
      .select()
      .single();
    if (error) throw error;
    return result as MonthlyRemarksRegister;
  },

  async updateRegister(
    id: string,
    patch: Partial<MonthlyRemarksRegister>
  ): Promise<MonthlyRemarksRegister> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MonthlyRemarksRegister;
  },

  async deleteRegister(id: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_REGISTER_TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // ----- Entries -----
  async listEntries(register_id: string): Promise<MonthlyRemarksEntry[]> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .select('*')
      .eq('register_id', register_id)
      .order('serial_no', { ascending: true });
    if (error) throw error;
    return (data ?? []) as MonthlyRemarksEntry[];
  },

  async createEntry(data: EntryUpsert): Promise<MonthlyRemarksEntry> {
    const { data: result, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .insert([data as any])
      .select()
      .single();
    if (error) throw error;
    return result as MonthlyRemarksEntry;
  },

  async updateEntry(
    id: string,
    patch: Partial<MonthlyRemarksEntry>
  ): Promise<MonthlyRemarksEntry> {
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MonthlyRemarksEntry;
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  /**
   * Bulk replace entries for a register: deletes existing entries and inserts new ones.
   * Use only when admin saves the whole table at once.
   */
  async replaceEntries(
    register_id: string,
    entries: Omit<EntryUpsert, 'register_id'>[]
  ): Promise<MonthlyRemarksEntry[]> {
    const { error: delErr } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .delete()
      .eq('register_id', register_id);
    if (delErr) throw delErr;

    if (entries.length === 0) return [];
    const rows = entries.map((e, i) => ({
      ...e,
      register_id,
      serial_no: e.serial_no ?? i + 1,
    }));
    const { data, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .insert(rows as any)
      .select();
    if (error) throw error;
    return (data ?? []) as MonthlyRemarksEntry[];
  },

  /**
   * List unique (class_name, month, academic_year) summaries with entry count.
   * Useful for admin dashboard.
   */
  async listRegisterSummaries(): Promise<
    (MonthlyRemarksRegister & { entry_count: number })[]
  > {
    const registers = await this.listRegisters();
    if (registers.length === 0) return [];
    const ids = registers.map((r) => r.id);
    const { data: counts, error } = await supabase
      .schema(SCHEMA)
      .from(MONTHLY_REMARKS_ENTRY_TABLE)
      .select('register_id')
      .in('register_id', ids);
    if (error) throw error;
    const countMap = new Map<string, number>();
    (counts ?? []).forEach((c: any) => {
      countMap.set(c.register_id, (countMap.get(c.register_id) ?? 0) + 1);
    });
    return registers.map((r) => ({
      ...r,
      entry_count: countMap.get(r.id) ?? 0,
    }));
  },
};
