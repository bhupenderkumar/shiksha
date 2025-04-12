// String Constants
const ERROR_MESSAGES = {
  ACCESS_DENIED: 'Access denied: User must be an admin or teacher.',
  FETCH_DASHBOARD: 'Error fetching dashboard data',
  FETCH_STUDENT_DATA: 'Error fetching student dashboard data'
};

const STATUS = {
  PENDING: 'PENDING',
  PRESENT: 'PRESENT',
  PAID: 'PAID',
  COMPLETED: 'COMPLETED'
};

const TEACHER_ROLE = 'TEACHER';

import { supabase } from '@/lib/api-client';
import { DASHBOARD_TABLE, SCHEMA, STUDENT_TABLE, STAFF_TABLE, CLASS_TABLE, HOMEWORK_TABLE, ATTENDANCE_TABLE, FEE_TABLE, CLASSWORK_TABLE } from '../lib/constants'; // Import constants
import { isAdmin, isTeacher, profileService } from './profileService'; // Import profile service
import { studentService } from './student.service';

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
  role: 'all' | 'admin' | 'teacher' | 'student' | string;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  console.log('📊 Getting dashboard summary for user:', userId);
  try {
    // Check user role and permissions
    console.log('🔍 Checking user role and permissions');
    const userProfile = await profileService.getUser(userId);

    if (!isAdmin(userProfile) && !isTeacher(userProfile)) {
      console.error('❌ User does not have required role:', userProfile);
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }

    console.log('✅ User has required permissions');

    // Fetch all required data in parallel
    console.log('🔄 Fetching dashboard data in parallel');
    const [
      { data: students, error: studentsError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: fees, error: feesError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.from(`${SCHEMA}.${STUDENT_TABLE}`).select('*'),
      supabase.from(`${SCHEMA}.${STAFF_TABLE}`).select('*').eq('role', TEACHER_ROLE),
      supabase.from(`${SCHEMA}.${CLASS_TABLE}`).select('*'),
      supabase.from(`${SCHEMA}.${HOMEWORK_TABLE}`).select('*'),
      supabase.from(`${SCHEMA}.${ATTENDANCE_TABLE}`).select('*'),
      supabase.from(`${SCHEMA}.${FEE_TABLE}`).select('*'),
      supabase.from(`${SCHEMA}.${CLASSWORK_TABLE}`).select('*')
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError || feesError || classworkError) {
      console.error('❌ Error fetching dashboard data:', studentsError || teachersError || classesError || homeworksError || attendanceError || feesError || classworkError);
      throw new Error(ERROR_MESSAGES.FETCH_DASHBOARD);
    }

    console.log('📈 Processing dashboard metrics');

    // Basic Stats
    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.filter(hw => hw.status === STATUS.PENDING)?.length || 0;

    // Attendance Stats
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === STATUS.PRESENT)?.length || 0;
    const averageAttendance = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) 
      : 0;

    // Fee Stats
    const totalFeeCollected = fees?.reduce((acc, fee) => acc + (fee.status === STATUS.PAID ? fee.amount : 0), 0) || 0;
    const totalPendingFees = fees?.reduce((acc, fee) => acc + (fee.status === STATUS.PENDING ? fee.amount : 0), 0) || 0;

    // Module Stats
    const moduleStats = {
      attendance: attendance?.length || 0,
      homework: homeworks?.length || 0,
      classwork: classes?.length || 0,
      fees: fees?.length || 0
    };

    // Get upcoming deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .from(`${SCHEMA}.Homework`)
      .select('*')
      .eq('status', STATUS.PENDING)
      .order('dueDate', { ascending: true })
      .limit(5);

    if (deadlinesError) {
      console.error('❌ Error fetching deadlines:', deadlinesError);
    }

    // Get performance metrics
    const performanceMetrics = {
      studentPerformance: calculatePerformanceMetrics(homeworks),
      attendanceTrend: calculateAttendanceTrend(attendance),
      feeCollection: calculateFeeCollectionTrend(fees)
    };

    // Define quick links based on role
    console.log('🎯 Fetching quick links');
    const quickLinks = getQuickLinks();

    // Compile all metrics
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
};

// Fetch students and handle user role
async function fetchStudents(userId: string) {
  const profile = await profileService.getUser(userId);
  const role = profile?.role || {};
  // Fetch students based on role
  const students = await supabase
    .from(`${SCHEMA}.${STUDENT_TABLE}`)
    .select('*')
    .eq('role', role);
  return students;
}

const calculatePerformanceMetrics = (homeworks: any[]) => {
  // Calculate last 6 months performance trend
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
  // Calculate last 6 months attendance trend
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
    
    const present = monthAttendance.filter(a => a.status === STATUS.PRESENT).length;
    return (present / (monthAttendance.length || 1)) * 100;
  });
};

const calculateFeeCollectionTrend = (fees: any[]) => {
  // Calculate last 6 months fee collection trend
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
    // {
    //   id: '4',
    //   title: 'View Reports',
    //   url: '/reports',
    //   icon: 'bar-chart',
    //   description: 'View academic reports',
    //   role: 'all'
    // },
    // {
    //   id: '5',
    //   title: 'Manage Classes',
    //   url: '/classes',
    //   icon: 'users',
    //   description: 'Manage class schedules',
    //   role: 'admin'
    // }
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

    // Fetch all required data in parallel
    console.log('🔄 Fetching student data in parallel');
    const [
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: fees, error: feesError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.from(`${SCHEMA}.${HOMEWORK_TABLE}`).select('*').eq('studentId', student.id),
      supabase.from(`${SCHEMA}.${ATTENDANCE_TABLE}`).select('*').eq('studentId', student.id),
      supabase.from(`${SCHEMA}.${FEE_TABLE}`).select('*').eq('studentId', student.id),
      supabase.from(`${SCHEMA}.${CLASSWORK_TABLE}`).select('*').eq('studentId', student.id)
    ]);

    if (homeworksError || attendanceError || feesError || classworkError) {
      console.error('❌ Error fetching student data:', homeworksError || attendanceError || feesError || classworkError);
      throw new Error(ERROR_MESSAGES.FETCH_STUDENT_DATA);
    }

    console.log('📊 Processing student metrics');

    // Calculate metrics
    const attendancePercentage = Math.round(
      ((attendance?.filter(a => a.status === STATUS.PRESENT).length || 0) / 
      (attendance?.length || 1)) * 100
    );

    const pendingTasks = (homeworks?.filter(h => h.status === STATUS.PENDING).length || 0) +
      (classwork?.filter(c => c.status === STATUS.PENDING).length || 0);

    const averageScore = Math.round(
      ((homeworks?.reduce((sum, hw) => sum + (hw.score || 0), 0) || 0) / 
      (homeworks?.length || 1))
    );

    const pendingFees = fees
      ?.filter(fee => fee.status === STATUS.PENDING)
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
