import { supabase } from '@/lib/api-client';
import { FeeStatus, FeeType } from '@/types/fee';
import { v4 as uuidv4 } from 'uuid';

export interface Fee {
  id: string;
  studentId: string;
  feeType: FeeType;
  amount: number;
  dueDate: string;
  status: FeeStatus;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
    classId: string;
    class?: {
      id: string;
      name: string;
      section: string;
    }
  };
}

export interface FeeFilter {
  classId?: string;
  studentId?: string;
  month?: number;
  year?: number;
  status?: FeeStatus;
}

export const feesService = {
  async createFee(feeData: Omit<Fee, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await supabase
      .schema('school')
      .from('Fee')
      .insert([{
        id: uuidv4(),
        ...feeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateFee(id: string, feeData: Partial<Fee>) {
    const { data, error } = await supabase
      .schema('school')
      .from('Fee')
      .update({
        ...feeData,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getFeesByStudent(studentId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('Fee')
      .select(`
        *,
        student:Student (
          id,
          name,
          admissionNumber,
          classId,
          class:Class (
            id,
            name,
            section
          )
        )
      `)
      .eq('studentId', studentId)
      .order('dueDate', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getFeesByFilter(filter: FeeFilter) {
    let query = supabase
      .schema('school')
      .from('Fee')
      .select(`
        *,
        student:Student (
          id,
          name,
          admissionNumber,
          classId,
          class:Class (
            id,
            name,
            section
          )
        )
      `);

    if (filter.studentId) {
      query = query.eq('studentId', filter.studentId);
    }
    if (filter.classId) {
      query = query.eq('student.classId', filter.classId);
    }
    if (filter.status) {
      query = query.eq('status', filter.status);
    }
    if (filter.month !== undefined && filter.year !== undefined) {
      const startDate = new Date(filter.year, filter.month, 1).toISOString();
      const endDate = new Date(filter.year, filter.month + 1, 0).toISOString();
      query = query.gte('dueDate', startDate).lte('dueDate', endDate);
    }

    const { data, error } = await query.order('dueDate', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getStudentsByClass(classId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('Student')
      .select('id, name, admissionNumber')
      .eq('classId', classId)
      .order('name');

    if (error) throw error;
    return data;
  },

  async getClasses() {
    const { data, error } = await supabase
      .schema('school')
      .from('Class')
      .select('id, name, section')
      .order('name');

    if (error) throw error;
    return data;
  }
};
