// String Constants
const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  HALF_DAY: 'HALF_DAY'
} as const;

const ERROR_MESSAGES = {
  CREATE_ATTENDANCE: 'Error creating attendance record:',
  UPDATE_ATTENDANCE: 'Error updating attendance record:',
  DELETE_ATTENDANCE: 'Error deleting attendance record:',
  FETCH_ATTENDANCE: 'Error fetching attendance records:'
};

const SORT_ORDER = {
  DATE_DESC: { ascending: false }
};

import { supabase } from '@/lib/api-client';
import { ATTENDANCE_TABLE, SCHEMA } from '@/lib/constants'; // Import SCHEMA
import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];

export type AttendanceType = {
  id: string;
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classid: string;
  createdAt: Date;
  updatedAt: Date;
  student?: {
    id: string;
    name: string;
    admissionNumber: string;
  };
};

type CreateAttendanceData = {
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
};

export const attendanceService = {
  async getAll(classId?: string, startDate?: Date, endDate?: Date) {
    try {
      let query = supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .select(`
          *,
          student:Student(id, name, admissionNumber)
        `)
        .order('date', SORT_ORDER.DATE_DESC);

      if (classId) {
        query = query.eq('classId', classId);
      }

      if (startDate) {
        query = query.gte('date', startDate.toISOString());
      }

      if (endDate) {
        query = query.lte('date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
        throw error;
      }

      return data.map((attendance: any) => ({
        ...attendance,
        date: new Date(attendance.date),
        createdAt: new Date(attendance.createdAt),
        updatedAt: new Date(attendance.updatedAt),
      }));
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
      throw error;
    }
  },

  async getByStudent(studentId: string, month?: Date) {
    try {
      let query = supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .select('*')
        .eq('studentId', studentId)
        .order('date', SORT_ORDER.DATE_DESC);

      if (month) {
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
        query = query
          .gte('date', startDate.toISOString())
          .lte('date', endDate.toISOString());
      }

      const { data, error } = await query;
      if (error) {
        console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
        throw error;
      }

      return data.map((attendance: any) => ({
        ...attendance,
        date: new Date(attendance.date),
        createdAt: new Date(attendance.createdAt),
        updatedAt: new Date(attendance.updatedAt),
      }));
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
      throw error;
    }
  },

  async create(data: CreateAttendanceData) {
    try {
      const attendanceRecord = {
        id: uuidv4(),
        date: data.date.toISOString(),
        status: data.status,
        studentId: data.studentId,
        classId: data.classId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const { data: createdRecord, error } = await supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .insert(attendanceRecord)
        .select()
        .single();

      if (error) {
        console.error(ERROR_MESSAGES.CREATE_ATTENDANCE, error);
        throw error;
      }
      return {
        ...createdRecord,
        date: new Date(createdRecord.date),
        createdAt: new Date(createdRecord.createdAt),
        updatedAt: new Date(createdRecord.updatedAt),
      };
    } catch (error) {
      console.error(ERROR_MESSAGES.CREATE_ATTENDANCE, error);
      throw error;
    }
  },

  async update(id: string, status: AttendanceStatus) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .update({
          status,
          updatedAt: new Date(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(ERROR_MESSAGES.UPDATE_ATTENDANCE, error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error(ERROR_MESSAGES.UPDATE_ATTENDANCE, error);
      throw error;
    }
  },

  async delete(id: string) {
    try {
      const { error } = await supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .delete()
        .eq('id', id);

      if (error) {
        console.error(ERROR_MESSAGES.DELETE_ATTENDANCE, error);
        throw error;
      }
    } catch (error) {
      console.error(ERROR_MESSAGES.DELETE_ATTENDANCE, error);
      throw error;
    }
  },

  async getStudentStats(studentId: string) {
    try {
      const { data, error } = await supabase
        .schema(SCHEMA) // Use SCHEMA constant
        .from(ATTENDANCE_TABLE)
        .select('status')
        .eq('studentId', studentId);

      if (error) {
        console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
        throw error;
      }

      const total = data.length;
      const present = data.filter(a => a.status === ATTENDANCE_STATUS.PRESENT).length;
      const absent = data.filter(a => a.status === ATTENDANCE_STATUS.ABSENT).length;
      const late = data.filter(a => a.status === ATTENDANCE_STATUS.LATE).length;
      const halfDay = data.filter(a => a.status === ATTENDANCE_STATUS.HALF_DAY).length;

      return {
        total,
        present,
        absent,
        late,
        halfDay,
        attendancePercentage: total ? ((present + (halfDay * 0.5)) / total) * 100 : 0
      };
    } catch (error) {
      console.error(ERROR_MESSAGES.FETCH_ATTENDANCE, error);
      throw error;
    }
  }
};
