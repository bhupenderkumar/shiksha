import { supabase } from '@/lib/supabase';

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingHomeworks: number;
  averageAttendance: number;
  recentActivities: Activity[];
  upcomingDeadlines: Deadline[];
}

interface Activity {
  id: string;
  type: 'homework' | 'attendance' | 'fee' | 'notification';
  title: string;
  description: string;
  timestamp: Date;
}

interface Deadline {
  id: string;
  type: 'homework' | 'fee';
  title: string;
  dueDate: Date;
}

export const getDashboardSummary = async (userId: string) => {
  try {
    const [
      { data: students },
      { data: teachers },
      { data: classes },
      { data: homeworks },
      { data: attendance }
    ] = await Promise.all([
      supabase.from('Student').select('id'),
      supabase.from('Staff').select('id').eq('role', 'TEACHER'),
      supabase.from('Class').select('id'),
      supabase.from('Homework').select('*').eq('status', 'PENDING'),
      supabase.from('Attendance').select('*')
    ]);

    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.length || 0;

    // Calculate average attendance
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT').length || 0;
    const averageAttendance = totalAttendance ? (presentAttendance / totalAttendance) * 100 : 0;

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingHomeworks,
      averageAttendance: Math.round(averageAttendance),
    };
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
};

export const getStudentDashboardData = async (studentId: string) => {
  try {
    const [
      { data: homeworks },
      { data: attendance },
      { data: fees },
      { data: notifications }
    ] = await Promise.all([
      supabase.from('Homework').select('*').eq('studentId', studentId),
      supabase.from('Attendance').select('*').eq('studentId', studentId),
      supabase.from('Fee').select('*').eq('studentId', studentId),
      supabase.from('Notification').select('*').eq('studentId', studentId).order('createdAt', { ascending: false }).limit(5)
    ]);

    return {
      homeworks: homeworks || [],
      attendance: attendance || [],
      fees: fees || [],
      notifications: notifications || [],
      summary: {
        totalHomeworks: homeworks?.length || 0,
        completedHomeworks: homeworks?.filter(h => h.status === 'COMPLETED').length || 0,
        attendancePercentage: calculateAttendancePercentage(attendance || []),
        pendingFees: fees?.filter(f => f.status === 'PENDING').length || 0,
      }
    };
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    throw error;
  }
};

const calculateAttendancePercentage = (attendance: any[]) => {
  if (!attendance.length) return 0;
  const present = attendance.filter(a => a.status === 'PRESENT').length;
  return Math.round((present / attendance.length) * 100);
};
