import { supabase } from '@/lib/api-client';
import { DASHBOARD_TABLE } from '../lib/constants';
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
  role: 'all' | 'admin' | 'teacher' | 'student';
}

export const getDashboardSummary = async (userId: string): Promise<DashboardSummary> => {
  try {
    const userProfile = await profileService.getUser(userId);

    // Check if user is admin or teacher
    if (!isAdmin(userProfile) && !isTeacher(userProfile)) {
      throw new Error('Access denied: User must be an admin or teacher.');
    }

    const [
      { data: students, error: studentsError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: fees, error: feesError },
      { data: classwork, error: classworkError }
    ] = await Promise.all([
      supabase.schema('school').from('Student').select('*'),
      supabase.schema('school').from('Staff').select('*').eq('role', 'TEACHER'),
      supabase.schema('school').from('Class').select('*'),
      supabase.schema('school').from('Homework').select('*'),
      supabase.schema('school').from('Attendance').select('*'),
      supabase.schema('school').from('Fee').select('*'),
      supabase.schema('school').from('Classwork').select('*')
    ]);

    if (studentsError || teachersError || classesError || homeworksError || attendanceError || feesError || classworkError) {
      throw new Error('Error fetching dashboard data');
    }

    // Basic Stats
    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const totalClasses = classes?.length || 0;
    const pendingHomeworks = homeworks?.filter(hw => hw.status === 'PENDING')?.length || 0;

    // Attendance Stats
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT')?.length || 0;
    const averageAttendance = totalAttendance > 0 
      ? (presentAttendance / totalAttendance) * 100 
      : 0;

    // Fee Stats
    const totalFeeCollected = fees?.reduce((acc, fee) => acc + (fee.status === 'PAID' ? fee.amount : 0), 0) || 0;
    const totalPendingFees = fees?.reduce((acc, fee) => acc + (fee.status === 'PENDING' ? fee.amount : 0), 0) || 0;

    // Module Stats
    const moduleStats = {
      attendance: attendance?.length || 0,
      homework: homeworks?.length || 0,
      classwork: classes?.length || 0,
      fees: fees?.length || 0
    };

    // Get upcoming deadlines
    const { data: deadlines, error: deadlinesError } = await supabase
      .from('Homework')
      .select('*')
      .eq('status', 'PENDING')
      .order('dueDate', { ascending: true })
      .limit(5);

    if (deadlinesError) {
      console.error('Error fetching deadlines:', deadlinesError);
    }

    // Get performance metrics
    const performanceMetrics = {
      studentPerformance: calculatePerformanceMetrics(homeworks),
      attendanceTrend: calculateAttendanceTrend(attendance),
      feeCollection: calculateFeeCollectionTrend(fees)
    };

    // Define quick links based on role
    const quickLinks = getQuickLinks();

    return {
      totalStudents,
      totalTeachers,
      totalClasses,
      pendingHomeworks,
      averageAttendance: Number(averageAttendance.toFixed(1)),
      totalFeeCollected,
      totalPendingFees,
      moduleStats,
      upcomingDeadlines: deadlines || [],
      quickLinks,
      performanceMetrics
    };
  } catch (error) {
    console.error('Error in getDashboardSummary:', error);
    throw error;
  }
};

// Fetch students and handle user role
async function fetchStudents(userId: string) {
  const profile = await profileService.getProfile(userId);
  const { role } = profile;
  // Fetch students based on role
  const students = await supabase
    .from('students')
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
    
    const present = monthAttendance.filter(a => a.status === 'PRESENT').length;
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

export const getStudentDashboardData = async (email: string) => {
  try {
    const student = await studentService.findByEmail(email);
    if (!student) throw new Error('Student not found');
    const studentId = student.id;

    const [
      { data: homeworks, error: homeworksError },
      { data: attendance, error: attendanceError },
      { data: deadlines, error: deadlinesError },
      { data: fees, error: feesError }
    ] = await Promise.all([
      supabase.schema('school').from('Homework').select('*').eq('classId', student.classId),
      supabase.schema('school').from('Attendance').select('*').eq('studentId', studentId),
      supabase.schema('school').from('Homework').select('*').eq('classId', student.classId).eq('status', 'PENDING').order('dueDate', { ascending: true }).limit(5),
      supabase.schema('school').from('Fee').select('*').eq('studentId', studentId)
    ]);

    if (homeworksError || attendanceError || deadlinesError || feesError) {
      throw new Error('Error fetching student dashboard data');
    }

    // Task Stats
    const completedTasks = homeworks?.filter(hw => hw.status === 'COMPLETED')?.length || 0;
    const pendingTasks = homeworks?.filter(hw => hw.status === 'PENDING')?.length || 0;

    // Attendance Stats
    const totalAttendance = attendance?.length || 0;
    const presentAttendance = attendance?.filter(a => a.status === 'PRESENT')?.length || 0;
    const attendancePercentage = totalAttendance > 0 ? (presentAttendance / totalAttendance) * 100 : 0;

    // Performance Stats
    const scores = homeworks?.map(hw => hw.score).filter(score => score != null) || [];
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    // Fee Stats
    const totalFees = fees?.reduce((acc, fee) => acc + fee.amount, 0) || 0;
    const paidFees = fees?.reduce((acc, fee) => acc + (fee.status === 'PAID' ? fee.amount : 0), 0) || 0;
    const pendingFees = totalFees - paidFees;

    return {
      completedTasks,
      pendingTasks,
      attendancePercentage: Number(attendancePercentage.toFixed(1)),
      averageScore: Number(averageScore.toFixed(1)),
      totalFees,
      paidFees,
      pendingFees,
    };
  } catch (error) {
    console.error('Error fetching student dashboard data:', error);
    throw error;
  }
};
