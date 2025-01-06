import { AttendanceStatus } from '@prisma/client';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  class?: {
    id: string;
    name: string;
    section: string;
  };
}

export const loadAttendance = async (
  date: Date,
  classId?: string,
  studentId?: string
): Promise<AttendanceType[]> => {
  try {
    // Format date to match the database date format (YYYY-MM-DD)
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    
    let query = supabase
      .schema('school')
      .from('Attendance')
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

    if (studentId) {
      query = query.eq('studentId', studentId);
    }

    if (classId) {
      // First get all students in the class
      const { data: studentsInClass } = await supabase
        .schema('school')
        .from('Student')
        .select('id')
        .eq('classId', classId);

      if (studentsInClass) {
        const studentIds = studentsInClass.map(s => s.id);
        query = query.in('studentId', studentIds);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading attendance:', error);
    throw error;
  }
};

export const createAttendance = async (data: {
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
}): Promise<AttendanceType> => {
  try {
    const { data: attendance, error } = await supabase
      .schema('school')
      .from('Attendance')
      .insert([{
        id: uuidv4(),
        ...data,
        date: data.date.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return attendance;
  } catch (error) {
    console.error('Error creating attendance:', error);
    throw error;
  }
};

export const bulkCreateAttendance = async (data: Array<{
  date: Date;
  status: AttendanceStatus;
  studentId: string;
  classId: string;
}>): Promise<AttendanceType[]> => {
  try {
    const formattedData = data.map(item => ({
      id: uuidv4(),
      ...item,
      date: item.date.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const { data: attendance, error } = await supabase
      .schema('school')
      .from('Attendance')
      .insert(formattedData)
      .select();

    if (error) throw error;
    return attendance;
  } catch (error) {
    console.error('Error creating bulk attendance:', error);
    throw error;
  }
};

export const updateAttendance = async (
  id: string,
  data: Partial<AttendanceType>
): Promise<AttendanceType> => {
  try {
    const { data: attendance, error } = await supabase
      .schema('school')
      .from('Attendance')
      .update({
        ...data,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return attendance;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

export const deleteAttendance = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .schema('school')
      .from('Attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};

export const getAttendanceStats = async (
  studentId: string,
  startDate: Date,
  endDate: Date
) => {
  try {
    const { data, error } = await supabase
      .schema('school')
      .from('Attendance')
      .select('*')
      .eq('studentId', studentId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString());

    if (error) throw error;

    const stats = {
      presentDays: data.filter(a => a.status === 'PRESENT').length,
      absentDays: data.filter(a => a.status === 'ABSENT').length,
      lateDays: data.filter(a => a.status === 'LATE').length,
      halfDays: data.filter(a => a.status === 'HALF_DAY').length,
      attendanceRate: calculateAttendanceRate(data),
    };

    return stats;
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    throw error;
  }
};

function calculateAttendanceRate(attendance: any[]): number {
  const totalDays = attendance.length;
  if (totalDays === 0) return 0;

  const presentDays = attendance.filter(
    a => a.status === 'PRESENT' || a.status === 'LATE'
  ).length;

  return Math.round((presentDays / totalDays) * 100);
}
