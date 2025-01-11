import { supabase } from '@/lib/api-client';
import { BaseService } from './base.service';
import type { AttendanceStatus } from '@/types/attendance';

export interface AttendanceType {
  id: string;
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
}

export const attendanceService = {
  async getAll(classId: string, startDate: Date, endDate: Date) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Attendance')
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber
          )
        `)
        .eq('classId', classId) // Fixed: Changed classid to classId
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  async getAttendance(filters: { date: Date; classId?: string; studentId?: string }) {
    try {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);

      let query = supabase
        .schema('school')
        .from('Attendance')
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber
          )
        `)
        .gte('date', startDate.toISOString())
        .lt('date', endDate.toISOString());

      if (filters.classId) {
        query = query.eq('classId', filters.classId); // Fixed: Changed classid to classId
      }

      if (filters.studentId) {
        query = query.eq('studentId', filters.studentId);
      }

      const { data, error } = await query.order('date', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading attendance:', error);
      throw error;
    }
  },

  async create(records: Array<{
    id: string;
    studentId: string;
    classId: string;
    date: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>) {
    try {
      const { data, error } = await supabase
        .schema('school')
        .from('Attendance')
        .insert(records)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating attendance records:', error);
      throw error;
    }
  }
};