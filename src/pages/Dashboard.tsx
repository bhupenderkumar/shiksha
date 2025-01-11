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
  const { profile, isAdminOrTeacher } = useProfileAccess();
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingHomeworks: 0,
    averageAttendance: 0,
    recentActivities: [],
    upcomingDeadlines: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profile?.id) return;
      
      try {
        setLoading(true);
        const dashboardData = isAdminOrTeacher 
          ? await getDashboardSummary(profile.id)
          : await getStudentDashboardData(profile.id);
        
        setStats(dashboardData || {});
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.id, isAdminOrTeacher]);

  return (
    <PageAnimation>
      <div className="flex">
        <div className="flex-1 p-8">
          <div className="mb-8">
            <AnimatedText 
              text={`Welcome back, ${profile?.full_name || 'User'}!`} 
              className="text-3xl font-bold" 
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isAdminOrTeacher ? (
                  <>
                    <StatsCard
                      title="Total Students"
                      value={stats.totalStudents || 0}
                      icon={<Users className="h-4 w-4" />}
                      description={stats.totalStudents ? `${stats.totalStudents} active students` : 'No students yet'}
                    />
                    <StatsCard
                      title="Total Teachers"
                      value={stats.totalTeachers || 0}
                      icon={<GraduationCap className="h-4 w-4" />}
                      description={stats.totalTeachers ? `${stats.totalTeachers} active teachers` : 'No teachers yet'}
                    />
                    <StatsCard
                      title="Total Classes"
                      value={stats.totalClasses || 0}
                      icon={<Book className="h-4 w-4" />}
                      description={stats.totalClasses ? `${stats.totalClasses} active classes` : 'No classes yet'}
                    />
                    <StatsCard
                      title="Pending Homeworks"
                      value={stats.pendingHomeworks || 0}
                      icon={<Clock className="h-4 w-4" />}
                      description={stats.pendingHomeworks ? `${stats.pendingHomeworks} pending submissions` : 'No pending homeworks'}
                    />
                  </>
                ) : (
                  <>
                    <StatsCard
                      title="Attendance"
                      value={`${stats.attendancePercentage || 0}%`}
                      icon={<CheckCircle className="h-4 w-4" />}
                      description={stats.attendancePercentage ? `Your attendance rate` : 'No attendance records yet'}
                    />
                    <StatsCard
                      title="Pending Tasks"
                      value={stats.pendingTasks || 0}
                      icon={<AlertCircle className="h-4 w-4" />}
                      description={stats.pendingTasks ? `${stats.pendingTasks} tasks to complete` : 'No pending tasks'}
                    />
                    <StatsCard
                      title="Completed Tasks"
                      value={stats.completedTasks || 0}
                      icon={<CheckCircle className="h-4 w-4" />}
                      description={stats.completedTasks ? `${stats.completedTasks} tasks completed` : 'No completed tasks yet'}
                    />
                    <StatsCard
                      title="Average Score"
                      value={`${stats.averageScore || 0}%`}
                      icon={<TrendingUp className="h-4 w-4" />}
                      description={stats.averageScore ? `Your average performance` : 'No scores available yet'}
                    />
                  </>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivities && stats.recentActivities.length > 0 ? (
                      <div className="space-y-4">
                        {stats.recentActivities.map((activity: any) => (
                          <ActivityItem
                            key={activity.id}
                            title={activity.title}
                            date={activity.timestamp}
                            icon={activity.type === 'homework' ? <Book className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                            status={activity.status}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No recent activities</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.upcomingDeadlines && stats.upcomingDeadlines.length > 0 ? (
                      <div className="space-y-4">
                        {stats.upcomingDeadlines.map((deadline: any) => (
                          <ActivityItem
                            key={deadline.id}
                            title={deadline.title}
                            date={deadline.dueDate}
                            icon={<Clock className="h-4 w-4" />}
                            status="pending"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No upcoming deadlines</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
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
