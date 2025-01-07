import { useEffect, useState } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar } from '@/components/ui/calendar';
import { classworkService } from '@/services/classworkService';
import { homeworkService } from '@/services/homeworkService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, 
  Users, 
  Calendar as CalendarIcon, 
  BookOpen, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Menu,
  Home,
  GraduationCap,
  UserCircle,
  FileText,
  Bell,
  Settings,
  DollarSign,
  BarChart,
  PieChart,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { attendanceService } from '@/services/attendanceService';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { studentService } from '@/services/student.service';
import { loadFees, FeeStatus, FeeType } from '@/services/feeService';
import { motion } from 'framer-motion';
import { PageAnimation } from '@/components/ui/page-animation';
import { AnimatedText } from '@/components/ui/animated-text';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [stats, setStats] = useState<any>({});
  const [recentClassworks, setRecentClassworks] = useState([]);
  const [recentHomeworks, setRecentHomeworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile) return;
      
      try {
        setLoading(true);
        
        if (isAdminOrTeacher) {
          // Admin/Teacher View Data
          const [classworksData, homeworksData, studentsData, feesData] = await Promise.all([
            classworkService.getAll(profile.role),
            homeworkService.getAll(profile.role),
            studentService.findMany(),
            loadFees()
          ]);

          const totalFees = feesData?.reduce((sum: number, fee: any) => sum + fee.amount, 0) || 0;
          const paidFees = feesData?.filter((fee: any) => fee.status === FeeStatus.PAID)
            .reduce((sum: number, fee: any) => sum + fee.amount, 0) || 0;
          const pendingFees = totalFees - paidFees;

          setStats({
            totalStudents: studentsData?.length || 0,
            totalClassworks: classworksData?.length || 0,
            totalHomeworks: homeworksData?.length || 0,
            pendingHomeworks: homeworksData?.filter((hw: any) => hw.status === 'PENDING')?.length || 0,
            totalFees,
            paidFees,
            pendingFees,
            feeCollectionRate: totalFees ? ((paidFees / totalFees) * 100).toFixed(1) : 0,
            averageAttendance: 85.5, // You can calculate this from attendance data
            activeStudents: studentsData?.filter((s: any) => s.status === 'ACTIVE')?.length || 0,
          });

          setRecentClassworks(classworksData?.slice(0, 5) || []);
          setRecentHomeworks(homeworksData?.slice(0, 5) || []);
        } else {
          // Student View Data
          const [classworksData, homeworksData, feesData] = await Promise.all([
            classworkService.getAll(profile.role, profile.classId),
            homeworkService.getAll(profile.role, profile.classId),
            loadFees(profile.id)
          ]);

          const totalFees = feesData?.reduce((sum: number, fee: any) => sum + fee.amount, 0) || 0;
          const paidFees = feesData?.filter((fee: any) => fee.status === FeeStatus.PAID)
            .reduce((sum: number, fee: any) => sum + fee.amount, 0) || 0;

          const attendanceStats = await attendanceService.getStudentStats(profile.id);

          setStats({
            totalClassworks: classworksData?.length || 0,
            completedHomeworks: homeworksData?.filter((hw: any) => hw.status === 'COMPLETED')?.length || 0,
            pendingHomeworks: homeworksData?.filter((hw: any) => hw.status === 'PENDING')?.length || 0,
            totalHomeworks: homeworksData?.length || 0,
            attendancePercentage: attendanceStats.attendancePercentage.toFixed(1),
            totalPresent: attendanceStats.present,
            totalAbsent: attendanceStats.absent,
            totalFees,
            paidFees,
            pendingFees: totalFees - paidFees,
            feesPaidPercentage: totalFees ? ((paidFees / totalFees) * 100).toFixed(1) : 0
          });

          setRecentClassworks(classworksData?.slice(0, 3) || []);
          setRecentHomeworks(homeworksData?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile, isAdminOrTeacher]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const dashboardStats = [
    { icon: Users, label: 'Total Students', value: stats.totalStudents, trend: '+12%' },
    { icon: BookOpen, label: 'Assignments', value: stats.totalHomeworks, trend: '+5%' },
    { icon: CalendarIcon, label: 'Attendance Rate', value: stats.averageAttendance, trend: '+3%' },
    { icon: DollarSign, label: 'Fee Collection', value: stats.totalFees, trend: '+8%' },
  ];

  const activities = [
    { title: 'New Student Enrollment', time: '2 hours ago', type: 'success' },
    { title: 'Assignment Submitted', time: '4 hours ago', type: 'info' },
    { title: 'Fee Payment Received', time: '6 hours ago', type: 'success' },
  ];

  return (
    <PageAnimation>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-2">
          <AnimatedText
            text={`Welcome back, ${profile?.name || 'User'}!`}
            className="text-2xl font-bold"
            variant="slideUp"
          />
          <p className="text-muted-foreground">Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card/60 transition-all">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </CardTitle>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-4 h-4 text-primary" />
                    </motion.div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center mt-1 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-green-500">{stat.trend}</span>
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    )} />
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Attendance Rate</span>
                    <span className="text-sm text-primary">92%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '92%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Assignment Completion</span>
                    <span className="text-sm text-primary">85%</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '85%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-primary"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageAnimation>
  );
}

// Sidebar Component
function DashboardSidebar({ profile, isAdminOrTeacher }: { profile: any; isAdminOrTeacher: boolean }) {
  const navigate = useNavigate();
  
  return (
    <div className="h-full border-r bg-card p-4 space-y-4">
      <div className="flex flex-col items-center space-y-2 border-b pb-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-lg font-semibold">{profile?.full_name}</h2>
        <p className="text-sm text-muted-foreground capitalize">{profile?.role.toLowerCase()}</p>
      </div>

      <nav className="space-y-2">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/dashboard">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        
        {isAdminOrTeacher ? (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/students">
                <Users className="mr-2 h-4 w-4" />
                Students
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/attendance">
                <CalendarIcon className="mr-2 h-4 w-4" />
                Attendance
              </Link>
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/homework">
                <BookOpen className="mr-2 h-4 w-4" />
                Homework
              </Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link to="/fees">
                <DollarSign className="mr-2 h-4 w-4" />
                Fees
              </Link>
            </Button>
          </>
        )}
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/classwork">
            <Book className="mr-2 h-4 w-4" />
            Classwork
          </Link>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </Button>
        
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link to="/profile">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </nav>
    </div>
  );
}

// Helper Components
function StatsCard({ title, value, icon, description, color = 'blue' }: any) {
  return (
    <Card className={`hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-${color}-100/50 bg-gradient-to-br from-white to-${color}-50/30`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`bg-${color}-100/50 p-2 rounded-full`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
        <div className={`h-1 w-full bg-${color}-100 rounded-full mt-3 overflow-hidden`}>
          <div 
            className={`h-full bg-${color}-600 rounded-full animate-progress`} 
            style={{ 
              width: typeof value === 'string' && value.includes('%') ? value : '100%'
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, date, icon, status, onClick }: any) {
  return (
    <div
      className="flex items-center space-x-4 rounded-md border p-4 hover:bg-accent cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="rounded-full bg-primary/10 p-2">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{title}</p>
        <p className="text-sm text-muted-foreground">
          {date}
          {status && (
            <span className={`ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
              status === 'COMPLETED' 
                ? 'bg-green-100 text-green-700'
                : status === 'PENDING'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {status.charAt(0) + status.slice(1).toLowerCase()}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
