import { supabase } from '@/lib/api-client';
import { ATTENDANCE_TABLE } from '@/lib/constants';
import { v4 as uuidv4 } from 'uuid';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

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
    let query = supabase
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .select(`
        *,
        student:Student(id, name, admissionNumber)
      `)
      .order('date', { ascending: false });

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
    if (error) throw error;

    return data.map((attendance: any) => ({
      ...attendance,
      date: new Date(attendance.date),
      createdAt: new Date(attendance.createdAt),
      updatedAt: new Date(attendance.updatedAt),
    }));
  },

  async getByStudent(studentId: string, month?: Date) {
    let query = supabase
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .select('*')
      .eq('studentId', studentId)
      .order('date', { ascending: false });

    if (month) {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((attendance: any) => ({
      ...attendance,
      date: new Date(attendance.date),
      createdAt: new Date(attendance.createdAt),
      updatedAt: new Date(attendance.updatedAt),
    }));
  },

  async create(data: CreateAttendanceData) {
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
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .insert(attendanceRecord)
      .select()
      .single();

    if (error) throw error;
    return {
      ...createdRecord,
      date: new Date(createdRecord.date),
      createdAt: new Date(createdRecord.createdAt),
      updatedAt: new Date(createdRecord.updatedAt),
    };
  },

  async update(id: string, status: AttendanceStatus) {
    const { data, error } = await supabase
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .update({
        status,
        updatedAt: new Date(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStudentStats(studentId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from(ATTENDANCE_TABLE)
      .select('status')
      .eq('studentId', studentId);

    if (error) throw error;

    const total = data.length;
    const present = data.filter(a => a.status === 'PRESENT').length;
    const absent = data.filter(a => a.status === 'ABSENT').length;
    const late = data.filter(a => a.status === 'LATE').length;
    const halfDay = data.filter(a => a.status === 'HALF_DAY').length;

    return {
      total,
      present,
      absent,
      late,
      halfDay,
      attendancePercentage: total ? ((present + (halfDay * 0.5)) / total) * 100 : 0
    };
  }
};
