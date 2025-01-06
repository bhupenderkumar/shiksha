import { supabase } from '@/lib/api-client';
import { AttendanceStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
  records: Array<{
    studentId: string;
    status: AttendanceStatus;
  }>;
  classId: string;
};

export const attendanceService = {
  async getAll(classId?: string, startDate?: Date, endDate?: Date) {
    let query = supabase
      .schema('school')
      .from('Attendance')
      .select(`
        *,
        student:Student(id, name, admissionNumber)
      `)
      .order('date', { ascending: false });

    if (classId) {
      query = query.eq('classid', classId);
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
      .from('Attendance')
      .select('*')
      .eq('studentId', studentId)
      .order('date', { ascending: false });

    if (month) {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      query = query
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((attendance: any) => ({
      ...attendance,
      date: new Date(attendance.date),
    }));
  },

  async create(data: CreateAttendanceData) {
    const { date, records, classId } = data;
    const attendanceRecords = records.map(record => ({
      
      date,
      classid: classId,
      id: uuidv4(),
      studentId: record.studentId,
      status: record.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const { data: createdRecords, error } = await supabase
      .schema('school')
      .from('Attendance')
      .insert(attendanceRecords)
      .select();

    if (error) throw error;
    return createdRecords;
  },

  async update(id: string, status: AttendanceStatus) {
    const { data, error } = await supabase
      .schema('school')
      .from('Attendance')
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
      .from('Attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getStudentStats(studentId: string) {
    const { data, error } = await supabase
      .schema('school')
      .from('Attendance')
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
