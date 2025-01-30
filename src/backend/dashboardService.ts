import { supabase } from '@/lib/api-client';
import { DASHBOARD_TABLE, SCHEMA, STUDENT_TABLE, STAFF_TABLE, CLASS_TABLE, HOMEWORK_TABLE, ATTENDANCE_TABLE, FEE_TABLE, CLASSWORK_TABLE } from '@/lib/constants';
import { isAdmin, isTeacher, profileService } from '../services/profileService';
import { studentService } from '../services/student.service';

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingHomeworks: number;
  averageAttendance: number;
  totalFeeCollected: number;
  totalPendingFees: number;
  upcomingDeadlines: Deadline[];
  moduleStats: {
    attendance: number;
    homework: number;
    classwork: number;
    fees: number;
  };
  quickLinks: QuickLink[];
  performanceMetrics: {
    studentPerformance?: number[];
    attendanceTrend?: number[];
    feeCollection?: number[];
  };
}

interface Deadline {
  id: string;
  type: 'homework' | 'fee' | 'exam' | 'classwork';
  title: string;
  dueDate: Date;
  status: string;
  priority?: 'low' | 'medium' | 'high';
}

interface QuickLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  description: string;
  role: 'all' | 'admin' | 'teacher' | 'student';
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  console.log('📊 Getting dashboard summary for user:', userId);
  try {
    const userProfile = await profileService.getUser(userId);

    if (!isAdmin(userProfile) && !isTeacher(userProfile)) {
      console.error('❌ User does not have required role:', userProfile);
      throw new Error('Access denied: User must be an admin or teacher.');
    }

    console.log('✅ User has required permissions');

    const [
      { data: students, error: studentsError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: fees, error: feesError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.schema(SCHEMA).from(STUDENT_TABLE).select('*'),
      supabase.schema(SCHEMA).from(STAFF_TABLE).select('*').eq('role', 'TEACHER'),
      supabase.schema(SCHEMA).from(CLASS_TABLE).select('*'),
      supabase.schema(SCHEMA).from(HOMEWORK_TABLE).select('*'),
      supabase.schema(SCHEMA).from(ATTENDANCE_TABLE).select('*'),
      supabase.schema(SCHEMA).from(FEE_TABLE).select('*'),
      supabase.schema(SCHEMA).from(CLASSWORK_TABLE).select('*')
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError || feesError || classworkError) {
      console.error('❌ Error fetching dashboard data:', studentsError || teachersError || classesError || homeworksError || attendanceError || feesError || classworkError);
      throw new Error('Error fetching dashboard data');
    }

    console.log('📈 Processing dashboard metrics');

    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.filter(hw => hw.status === 'PENDING')?.length || 0;

    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT')?.length || 0;
    const averageAttendance = totalAttendance > 0
      ? Math.round((presentAttendance / totalAttendance) * 100)
      : 0;

    const totalFeeCollected = fees?.reduce((acc, fee) => acc + (fee.status === 'PAID' ? fee.amount : 0), 0) || 0;
    const totalPendingFees = fees?.reduce((acc, fee) => acc + (fee.status === 'PENDING' ? fee.amount : 0), 0) || 0;

    const moduleStats = {
      attendance: attendance?.length || 0,
      homework: homeworks?.length || 0,
      classwork: classes?.length || 0,
      fees: fees?.length || 0
    };

    const { data: deadlines, error: deadlinesError } = await supabase
      .schema(SCHEMA)
      .from('Homework')
      .select('*')
      .eq('status', 'PENDING')
      .order('dueDate', { ascending: true })
      .limit(5);

    if (deadlinesError) {
      console.error('❌ Error fetching deadlines:', deadlinesError);
    }

    const performanceMetrics = {
      studentPerformance: calculatePerformanceMetrics(homeworks),
      attendanceTrend: calculateAttendanceTrend(attendance),
      feeCollection: calculateFeeCollectionTrend(fees)
    };

    console.log('🎯 Fetching quick links');
    const quickLinks = getQuickLinks();

    const dashboardSummary: DashboardSummary = {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingHomeworks,
      averageAttendance,
      totalFeeCollected,
      totalPendingFees,
      moduleStats,
      upcomingDeadlines: deadlines || [],
      quickLinks,
      performanceMetrics
    };

    console.log('✅ Dashboard summary compiled successfully:', dashboardSummary);
    return dashboardSummary;
  } catch (error) {
    console.error('❌ Error in getDashboardSummary:', error);
    throw error;
  }
}

async function fetchStudents(userId: string) {
  const profile = await profileService.getUser(userId);
  const role = profile?.role || {};
  const students = await supabase
    .schema(SCHEMA)
    .from(STUDENT_TABLE)
    .select('*')
    .eq('role', role);
  return students;
}

const calculatePerformanceMetrics = (homeworks: any[]) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();

  return months.map(month => {
    const monthHomeworks = homeworks?.filter(hw =>
      new Date(hw.submitted_at).getMonth() === month.getMonth() &&
      new Date(hw.submitted_at).getFullYear() === month.getFullYear()
    ) || [];

    return monthHomeworks.reduce((acc, hw) => acc + (hw.score || 0), 0) / (monthHomeworks.length || 1);
  });
};

const calculateAttendanceTrend = (attendance: any[]) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();

  return months.map(month => {
    const monthAttendance = attendance?.filter(a =>
      new Date(a.date).getMonth() === month.getMonth() &&
      new Date(a.date).getFullYear() === month.getFullYear()
    ) || [];

    const present = monthAttendance.filter(a => a.status === 'PRESENT').length;
    return (present / (monthAttendance.length || 1)) * 100;
  });
};

const calculateFeeCollectionTrend = (fees: any[]) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();

  return months.map(month => {
    const monthFees = fees?.filter(f =>
      new Date(f.paid_at).getMonth() === month.getMonth() &&
      new Date(f.paid_at).getFullYear() === month.getFullYear()
    ) || [];

    return monthFees.reduce((acc, fee) => acc + (fee.amount || 0), 0);
  });
};

const getQuickLinks = () => {
  return [
    {
      id: '1',
      title: 'Take Attendance',
      url: '/attendance',
      icon: 'check-square',
      description: 'Mark attendance for classes',
      role: 'all'
    },
    {
      id: '2',
      title: 'Submit Homework',
      url: '/homework',
      icon: 'book',
      description: 'Submit pending homework',
      role: 'all'
    },
    {
      id: '3',
      title: 'Pay Fees',
      url: '/fees',
      icon: 'credit-card',
      description: 'Pay pending fees',
      role: 'all'
    },
  ];
};

export async function getStudentDashboardData(email: string) {
  console.log('📚 Getting student dashboard data for:', email);
  try {
    const student = await studentService.findByEmail(email);
    if (!student) {
      console.error('❌ Student not found for email:', email);
      throw new Error('Student not found');
    }

    console.log('👤 Found student:', student);

    const [
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: fees, error: feesError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.schema(SCHEMA).from(HOMEWORK_TABLE).select('*').eq('studentId', student.id),
      supabase.schema(SCHEMA).from(ATTENDANCE_TABLE).select('*').eq('studentId', student.id),
      supabase.schema(SCHEMA).from(FEE_TABLE).select('*').eq('studentId', student.id),
      supabase.schema(SCHEMA).from(CLASSWORK_TABLE).select('*').eq('studentId', student.id)
    ]);

    if (homeworksError || attendanceError || feesError || classworkError) {
      console.error('❌ Error fetching student data:', homeworksError || attendanceError || feesError || classworkError);
      throw new Error('Error fetching student data');
    }

    console.log('📊 Processing student metrics');

    const attendancePercentage = Math.round(
      ((attendance?.filter(a => a.status === 'PRESENT').length || 0) /
      (attendance?.length || 1)) * 100
    );

    const pendingTasks = (homeworks?.filter(h => h.status === 'PENDING').length || 0) +
      (classwork?.filter(c => c.status === 'PENDING').length || 0);

    const averageScore = Math.round(
      ((homeworks?.reduce((sum, hw) => sum + (hw.score || 0), 0) || 0) /
      (homeworks?.length || 1))
    );

    const pendingFees = fees
      ?.filter(fee => fee.status === 'PENDING')
      .reduce((sum, fee) => sum + fee.amount, 0) || 0;

    console.log('🎯 Fetching quick links');
    const quickLinks = getQuickLinks();

    const studentDashboard = {
      attendancePercentage,
      pendingTasks,
      averageScore,
      pendingFees,
      quickLinks: quickLinks.filter(link => link.role === 'all' || link.role === 'student'),
      performanceMetrics: {
        studentPerformance: calculatePerformanceMetrics(homeworks),
        attendanceTrend: calculateAttendanceTrend(attendance)
      }
    };

    console.log('✅ Student dashboard compiled successfully:', studentDashboard);
    return studentDashboard;
  } catch (error) {
    console.error('❌ Error in getStudentDashboardData:', error);
    throw error;
  }
}