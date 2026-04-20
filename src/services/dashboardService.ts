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
import { SCHEMA, STUDENT_TABLE, STAFF_TABLE, CLASS_TABLE, HOMEWORK_TABLE, ATTENDANCE_TABLE, FEE_PAYMENTS_TABLE, CLASSWORK_TABLE, ID_CARD_TABLE } from '../lib/constants';
import { isAdmin, isTeacher, profileService } from './profileService';
import { studentService } from './student.service';

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingHomeworks: number;
  totalHomeworks: number;
  totalClasswork: number;
  averageAttendance: number;
  totalFeeCollected: number;
  totalPendingFees: number;
  currentMonthFeeCollected: number;
  currentMonthPending: number;
  upcomingDeadlines: Deadline[];
  recentClasswork: RecentClasswork[];
  quickLinks: QuickLink[];
  performanceMetrics: {
    attendanceTrend?: number[];
    feeCollection?: number[];
    homeworkTrend?: number[];
  };
}

interface Deadline {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  classId?: string;
}

interface RecentClasswork {
  id: string;
  title: string;
  date: string;
  workType?: string;
  completionStatus?: string;
  classId?: string;
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
  try {
    const userProfile = await profileService.getUser(userId);

    if (!isAdmin(userProfile) && !isTeacher(userProfile)) {
      console.error('User does not have required role:', userProfile);
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }

    // Fetch only columns that actually exist in the schema
    const [
      { data: students, error: studentsError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: feePayments, error: feePaymentsError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.schema(SCHEMA as any).from(STUDENT_TABLE).select('id'),
      supabase.schema(SCHEMA as any).from(STAFF_TABLE).select('id').eq('role', TEACHER_ROLE),
      supabase.schema(SCHEMA as any).from(CLASS_TABLE).select('id, name'),
      supabase.schema(SCHEMA as any).from(HOMEWORK_TABLE).select('id, status, dueDate, title, classId, createdAt'),
      supabase.schema(SCHEMA as any).from(ATTENDANCE_TABLE).select('id, status, date'),
      supabase.schema(SCHEMA as any).from(FEE_PAYMENTS_TABLE).select('id, amount_received, balance_remaining, payment_status, payment_date'),
      supabase.schema(SCHEMA as any).from(CLASSWORK_TABLE).select('id, title, date, workType, completionStatus, classId').order('date', { ascending: false }).limit(10)
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError || feePaymentsError || classworkError) {
      console.error('Dashboard query errors:', { studentsError, teachersError, classesError, homeworksError, attendanceError, feePaymentsError, classworkError });
      throw new Error(ERROR_MESSAGES.FETCH_DASHBOARD);
    }

    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.filter(hw => hw.status === STATUS.PENDING)?.length || 0;
    const totalHomeworks = homeworks?.length || 0;
    const totalClasswork = classwork?.length || 0;

    // Attendance Stats
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === STATUS.PRESENT)?.length || 0;
    const averageAttendance = totalAttendance > 0 
      ? Math.round((presentAttendance / totalAttendance) * 100) 
      : 0;

    // Fee Stats
    const totalFeeCollected = feePayments?.reduce((acc, payment) => {
      return acc + (Number(payment.amount_received) || 0);
    }, 0) || 0;
    
    const totalPendingFees = feePayments?.reduce((acc, payment) => {
      if (payment.payment_status === 'pending' || payment.payment_status === 'partial') {
        return acc + (Number(payment.balance_remaining) || 0);
      }
      return acc;
    }, 0) || 0;
    
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

    // Upcoming deadlines from homework
    const upcomingDeadlines: Deadline[] = (homeworks || [])
      .filter(hw => hw.status === STATUS.PENDING && hw.dueDate)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
      .map(hw => ({
        id: hw.id,
        title: hw.title || 'Untitled',
        dueDate: hw.dueDate,
        status: hw.status,
        classId: hw.classId,
      }));

    // Recent classwork
    const recentClasswork: RecentClasswork[] = (classwork || []).slice(0, 5).map(cw => ({
      id: cw.id,
      title: cw.title || 'Untitled',
      date: cw.date,
      workType: cw.workType,
      completionStatus: cw.completionStatus,
      classId: cw.classId,
    }));

    // Performance metrics using available columns
    const performanceMetrics = {
      attendanceTrend: calculateAttendanceTrend(attendance),
      feeCollection: calculateFeeCollectionTrend(feePayments),
      homeworkTrend: calculateHomeworkTrend(homeworks),
    };

    const quickLinks = getQuickLinks();

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingHomeworks,
      totalHomeworks,
      totalClasswork,
      averageAttendance,
      totalFeeCollected,
      totalPendingFees,
      currentMonthFeeCollected,
      currentMonthPending,
      upcomingDeadlines,
      recentClasswork,
      quickLinks,
      performanceMetrics,
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    throw error;
  }
}

const calculateHomeworkTrend = (homeworks: any[] | null) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();
  
  return months.map(month => {
    return (homeworks || []).filter(hw => {
      if (!hw.createdAt) return false;
      const d = new Date(hw.createdAt);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    }).length;
  });
};

const calculateAttendanceTrend = (attendance: any[] | null) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();
  
  return months.map(month => {
    const monthAttendance = (attendance || []).filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
    });
    
    const present = monthAttendance.filter(a => a.status === STATUS.PRESENT).length;
    return monthAttendance.length > 0 ? Math.round((present / monthAttendance.length) * 100) : 0;
  });
};

const calculateFeeCollectionTrend = (feePayments: any[] | null) => {
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d;
  }).reverse();
  
  return months.map(month => {
    const monthPayments = (feePayments || []).filter(payment => {
      if (!payment.payment_date) return false;
      const pDate = new Date(payment.payment_date);
      return pDate.getMonth() === month.getMonth() && pDate.getFullYear() === month.getFullYear();
    });
    
    return monthPayments.reduce((acc, payment) => acc + (Number(payment.amount_received) || 0), 0);
  });
};

const getQuickLinks = (): QuickLink[] => {
  return [
    {
      id: '1',
      title: 'Take Attendance',
      url: '/attendance',
      icon: 'check-square',
      description: 'Mark daily attendance',
      role: 'admin'
    },
    {
      id: '2',
      title: 'Manage Homework',
      url: '/homework',
      icon: 'book',
      description: 'Assign & track homework',
      role: 'admin'
    },
    {
      id: '3',
      title: 'Fee Management',
      url: '/fees',
      icon: 'credit-card',
      description: 'Collect & track fees',
      role: 'admin'
    },
    {
      id: '4',
      title: 'View Students',
      url: '/students',
      icon: 'users',
      description: 'Student directory',
      role: 'admin'
    },
    {
      id: '5',
      title: 'View Homework',
      url: '/homework',
      icon: 'book',
      description: 'Check assigned homework',
      role: 'student'
    },
    {
      id: '6',
      title: 'Fee Status',
      url: '/fees',
      icon: 'credit-card',
      description: 'View fee payments',
      role: 'student'
    },
    {
      id: '7',
      title: 'AI Planner',
      url: '/next-day-plan',
      icon: 'bar-chart',
      description: 'Plan next day',
      role: 'admin'
    },
    {
      id: '8',
      title: 'Classwork',
      url: '/classwork',
      icon: 'book',
      description: 'View classwork',
      role: 'student'
    },
  ];
};

export async function getStudentDashboardData(email: string) {
  try {
    const student = await studentService.findByEmail(email);
    if (!student) {
      return {
        studentName: '',
        className: '',
        attendancePercentage: 0,
        pendingHomeworks: 0,
        totalHomeworks: 0,
        pendingFees: 0,
        recentHomework: [],
        recentClasswork: [],
        quickLinks: getQuickLinks().filter(link => link.role === 'all' || link.role === 'student'),
        performanceMetrics: { attendanceTrend: [0, 0, 0, 0, 0, 0] },
      };
    }

    const classId = student.classId;

    // Fetch data using correct columns - homework/classwork are per-class, not per-student
    const [
      { data: homeworks },
      { data: attendance },
      { data: classwork },
    ] = await Promise.all([
      supabase.schema(SCHEMA as any).from(HOMEWORK_TABLE)
        .select('id, title, status, dueDate, classId, createdAt')
        .eq('classId', classId)
        .order('createdAt', { ascending: false })
        .limit(20),
      supabase.schema(SCHEMA as any).from(ATTENDANCE_TABLE)
        .select('id, status, date')
        .eq('studentId', student.id),
      supabase.schema(SCHEMA as any).from(CLASSWORK_TABLE)
        .select('id, title, date, workType, completionStatus, classId')
        .eq('classId', classId)
        .order('date', { ascending: false })
        .limit(10),
    ]);

    // Try to get fee data via IDCard
    let pendingFees = 0;
    const { data: idCard } = await supabase
      .schema(SCHEMA as any)
      .from(ID_CARD_TABLE)
      .select('id')
      .or(`student_email.eq.${email},parent_email.eq.${email}`)
      .maybeSingle();

    if (idCard?.id) {
      const { data: feeData } = await supabase
        .schema(SCHEMA as any)
        .from(FEE_PAYMENTS_TABLE)
        .select('payment_status, balance_remaining')
        .eq('student_id', idCard.id);

      pendingFees = (feeData || [])
        .filter(p => p.payment_status === 'pending' || p.payment_status === 'partial')
        .reduce((sum, p) => sum + (Number(p.balance_remaining) || 0), 0);
    }

    // Attendance calculation
    const attendanceRecords = attendance || [];
    const presentCount = attendanceRecords.filter(a => a.status === STATUS.PRESENT).length;
    const attendancePercentage = attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;

    const pendingHomeworks = (homeworks || []).filter(h => h.status === STATUS.PENDING).length;

    return {
      studentName: student.name || '',
      className: (student as any).class?.name || '',
      attendancePercentage,
      pendingHomeworks,
      totalHomeworks: (homeworks || []).length,
      pendingFees,
      recentHomework: (homeworks || []).slice(0, 5).map(hw => ({
        id: hw.id,
        title: hw.title || 'Untitled',
        status: hw.status,
        dueDate: hw.dueDate,
      })),
      recentClasswork: (classwork || []).slice(0, 5).map(cw => ({
        id: cw.id,
        title: cw.title || 'Untitled',
        date: cw.date,
        workType: cw.workType,
        completionStatus: cw.completionStatus,
      })),
      quickLinks: getQuickLinks().filter(link => link.role === 'all' || link.role === 'student'),
      performanceMetrics: {
        attendanceTrend: calculateAttendanceTrend(attendance),
      },
    };
  } catch (error) {
    console.error('Error in getStudentDashboardData:', error);
    throw error;
  }
}
