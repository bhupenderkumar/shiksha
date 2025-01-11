import { supabase } from '@/lib/api-client';

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

export const getDashboardSummary = async (userId: string): Promise<DashboardSummary> => {
  try {
    const [
      { data: students, error: studentsError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError }
    ] = await Promise.all([
      supabase.from('Student').select('id'),
      supabase.from('Staff').select('id').eq('role', 'TEACHER'),
      supabase.from('Class').select('id'),
      supabase.from('Homework').select('*').eq('status', 'PENDING'),
      supabase.from('Attendance').select('*')
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError) {
      throw new Error('Error fetching dashboard data');
    }

    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.length || 0;

    // Calculate average attendance
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT').length || 0;
    const averageAttendance = totalAttendance > 0 
      ? (presentAttendance / totalAttendance) * 100 
      : 0;

    // Get recent activities
    const { data: activities, error: activitiesError } = await supabase
      .from('Activity')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);

    if (activitiesError) {
      console.error('Error fetching activities:', activitiesError);
    }

    // Get upcoming deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .from('Homework')
      .select('*')
      .eq('status', 'PENDING')
      .order('due_date', { ascending: true })
      .limit(5);

    if (deadlinesError) {
      console.error('Error fetching deadlines:', deadlinesError);
    }

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingHomeworks,
      averageAttendance: Number(averageAttendance.toFixed(1)),
      recentActivities: activities || [],
      upcomingDeadlines: deadlines || []
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    throw error;
  }
};

export const getStudentDashboardData = async (studentId: string) => {
  try {
    const [
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: activities, error: activitiesError },
      { data: deadlines, error: deadlinesError }
    ] = await Promise.all([
      supabase.from('Homework').select('*').eq('student_id', studentId),
      supabase.from('Attendance').select('*').eq('student_id', studentId),
      supabase.from('Activity').select('*').eq('student_id', studentId).order('timestamp', { ascending: false }).limit(5),
      supabase.from('Homework').select('*').eq('student_id', studentId).eq('status', 'PENDING').order('due_date', { ascending: true }).limit(5)
    ]);

    if (homeworksError || attendanceError || activitiesError || deadlinesError) {
      throw new Error('Error fetching student dashboard data');
    }

    const completedTasks = homeworks?.filter(hw => hw.status === 'COMPLETED').length || 0;
    const pendingTasks = homeworks?.filter(hw => hw.status === 'PENDING').length || 0;
    
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT').length || 0;
    const attendancePercentage = totalAttendance > 0 
      ? (presentAttendance / totalAttendance) * 100 
      : 0;

    const scores = homeworks?.map(hw => hw.score).filter(score => score != null) || [];
    const averageScore = scores.length > 0 
      ? scores.reduce((a, b) => a + b, 0) / scores.length 
      : 0;

    return {
      completedTasks,
      pendingTasks,
      attendancePercentage: Number(attendancePercentage.toFixed(1)),
      averageScore: Number(averageScore.toFixed(1)),
      recentActivities: activities || [],
      upcomingDeadlines: deadlines || []
    };
  } catch (error) {
    console.error('Error in getStudentDashboardData:', error);
    throw error;
  }
};
