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
import { DASHBOARD_TABLE, SCHEMA, STUDENT_TABLE, STAFF_TABLE, CLASS_TABLE, HOMEWORK_TABLE, ATTENDANCE_TABLE, FEE_TABLE, FEE_PAYMENTS_TABLE, CLASSWORK_TABLE, ID_CARD_TABLE } from '../lib/constants'; // Import constants
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
  currentMonthFeeCollected: number;
  currentMonthPending: number;
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
      { data: feePayments, error: feePaymentsError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.schema(SCHEMA as any).from(STUDENT_TABLE).select('*'),
      supabase.schema(SCHEMA as any).from(STAFF_TABLE).select('*').eq('role', TEACHER_ROLE),
      supabase.schema(SCHEMA as any).from(CLASS_TABLE).select('*'),
      supabase.schema(SCHEMA as any).from(HOMEWORK_TABLE).select('*'),
      supabase.schema(SCHEMA as any).from(ATTENDANCE_TABLE).select('*'),
      // Use fee_payments table for accurate fee tracking
      supabase.schema(SCHEMA as any).from(FEE_PAYMENTS_TABLE).select('*'),
      supabase.schema(SCHEMA as any).from(CLASSWORK_TABLE).select('*')
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError || feePaymentsError || classworkError) {
      console.error('❌ Error fetching dashboard data:', studentsError || teachersError || classesError || homeworksError || attendanceError || feePaymentsError || classworkError);
      throw new Error(ERROR_MESSAGES.FETCH_DASHBOARD);
    }

    console.log('📈 Processing dashboard metrics');
    console.log('💰 Fee payments data:', feePayments?.length, 'records');

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

    // Fee Stats from fee_payments table
    // payment_status: 'completed', 'partial', 'pending'
    const totalFeeCollected = feePayments?.reduce((acc, payment) => {
      return acc + (Number(payment.amount_received) || 0);
    }, 0) || 0;
    
    const totalPendingFees = feePayments?.reduce((acc, payment) => {
      // Sum up balance_remaining for all payments that are not fully completed
      if (payment.payment_status === 'pending' || payment.payment_status === 'partial') {
        return acc + (Number(payment.balance_remaining) || 0);
      }
      return acc;
    }, 0) || 0;
    
    // Current month fee stats
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const currentMonthPayments = feePayments?.filter(payment => {
      const paymentDate = payment.payment_date;
      if (!paymentDate) return false;
      const pDate = new Date(paymentDate);
      return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
    }) || [];
    
    const currentMonthFeeCollected = currentMonthPayments.reduce((acc, payment) => {
      return acc + (Number(payment.amount_received) || 0);
    }, 0);
    
    const currentMonthPending = currentMonthPayments.reduce((acc, payment) => {
      if (payment.payment_status === 'pending' || payment.payment_status === 'partial') {
        return acc + (Number(payment.balance_remaining) || 0);
      }
      return acc;
    }, 0);

    // Module Stats
    const moduleStats = {
      attendance: attendance?.length || 0,
      homework: homeworks?.length || 0,
      classwork: classes?.length || 0,
      fees: feePayments?.length || 0
    };

    // Get upcoming deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .schema(SCHEMA as any)
      .from(HOMEWORK_TABLE)
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
      feeCollection: calculateFeeCollectionTrend(feePayments)
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
      currentMonthFeeCollected,
      currentMonthPending,
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
    .schema(SCHEMA as any)
    .from(STUDENT_TABLE)
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

const calculateFeeCollectionTrend = (feePayments: any[]) => {
  // Calculate last 6 months fee collection trend using fee_payments table
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();
  
  return months.map(month => {
    // Filter by payment_date from fee_payments table
    const monthPayments = feePayments?.filter(payment => {
      const paymentDate = payment.payment_date;
      if (!paymentDate) return false;
      const pDate = new Date(paymentDate);
      return pDate.getMonth() === month.getMonth() &&
             pDate.getFullYear() === month.getFullYear();
    }) || [];
    
    return monthPayments.reduce((acc, payment) => acc + (Number(payment.amount_received) || 0), 0);
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

    // First, try to find the student's IDCard to get fee payments
    const { data: idCard, error: idCardError } = await supabase
      .schema(SCHEMA as any)
      .from(ID_CARD_TABLE)
      .select('id')
      .or(`student_email.eq.${email},parent_email.eq.${email}`)
      .single();

    console.log('🎫 IDCard lookup:', idCard, idCardError);

    // Fetch all required data in parallel
    console.log('🔄 Fetching student data in parallel');
    const queries: Promise<any>[] = [
      supabase.schema(SCHEMA as any).from(HOMEWORK_TABLE).select('*').eq('studentId', student.id),
      supabase.schema(SCHEMA as any).from(ATTENDANCE_TABLE).select('*').eq('studentId', student.id),
      supabase.schema(SCHEMA as any).from(CLASSWORK_TABLE).select('*').eq('studentId', student.id)
    ];

    // If we have an IDCard, fetch fee payments for that student
    if (idCard?.id) {
      queries.push(
        supabase.schema(SCHEMA as any).from(FEE_PAYMENTS_TABLE).select('*').eq('student_id', idCard.id)
      );
    } else {
      // Fallback: try to fetch from Fee table using studentId
      queries.push(
        supabase.schema(SCHEMA as any).from(FEE_TABLE).select('*').eq('studentId', student.id)
      );
    }

    const [
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: classwork, error: classworkError },
      { data: feeData, error: feeError }
    ] = await Promise.all(queries);

    if (homeworksError || attendanceError || classworkError || feeError) {
      console.error('❌ Error fetching student data:', homeworksError || attendanceError || classworkError || feeError);
      throw new Error(ERROR_MESSAGES.FETCH_STUDENT_DATA);
    }

    console.log('📊 Processing student metrics');
    console.log('💰 Fee data for student:', feeData?.length, 'records');

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

    // Calculate pending fees based on which table we're using
    let pendingFees = 0;
    if (idCard?.id && feeData) {
      // Using fee_payments table - sum up balance_remaining for pending/partial payments
      pendingFees = feeData
        .filter(payment => payment.payment_status === 'pending' || payment.payment_status === 'partial')
        .reduce((sum, payment) => sum + (Number(payment.balance_remaining) || 0), 0);
    } else if (feeData) {
      // Using Fee table fallback
      pendingFees = feeData
        .filter(fee => fee.status === STATUS.PENDING || fee.status === 'OVERDUE')
        .reduce((sum, fee) => sum + (fee.amount || 0), 0);
    }

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
