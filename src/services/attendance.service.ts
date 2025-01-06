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

class AttendanceService extends BaseService {
  constructor() {
    super('Attendance');
  }

  async getAttendance(filters: { date: Date; classId?: string; studentId?: string }) {
    try {
      const startDate = new Date(filters.date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filters.date);
      endDate.setHours(23, 59, 59, 999);

      let query = this.query
        .select(`
          *,
          student:Student (
            id,
            name,
            admissionNumber,
            classId
          )
        `)
        .gte('date', startDate.toISOString())
        .lt('date', endDate.toISOString());

      if (filters.studentId) {
        query = query.eq('studentId', filters.studentId);
      }

      if (filters.classId) {
        query = query.eq('classId', filters.classId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (error) {
      this.handleError(error, 'Error loading attendance');
      return [];
    }
  }

  // ... other methods
}

export const attendanceService = new AttendanceService();