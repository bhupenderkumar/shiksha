import { useEffect, useState } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Book, Users, Calendar as CalendarIcon, BookOpen, Clock,
  CheckCircle, XCircle, AlertCircle, Menu, Home, GraduationCap,
  UserCircle, FileText, Bell, Settings, DollarSign, BarChart,
  PieChart, TrendingUp, School, BookCheck, CreditCard, CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { PageAnimation } from '@/components/ui/page-animation';
import { AnimatedText } from '@/components/ui/animated-text';
import { cn } from '@/lib/utils';
import { getDashboardSummary, getStudentDashboardData } from '@/services/dashboardService';
import { LineChart } from '@/components/ui/line-chart';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'react-hot-toast'; // Import toast
import { EmptyState } from '@/components/ui/empty-state';
import FeeCard from '@/components/ui/FeeCard';

export default function Dashboard() {
  const { profile, isAdminOrTeacher } = useProfileAccess();
  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingHomeworks: 0,
    averageAttendance: 0,
    totalFeeCollected: 0,
    totalPendingFees: 0,
    moduleStats: {
      attendance: 0,
      homework: 0,
      classwork: 0,
      fees: 0
    },
    recentActivities: [],
    upcomingDeadlines: [],
    quickLinks: [],
    announcements: [],
    performanceMetrics: {
      studentPerformance: [],
      attendanceTrend: [],
      feeCollection: []
    }
  });
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profile?.email) return;
      
      try {
        setLoading(true);
        const dashboardData = isAdminOrTeacher 
          ? await getDashboardSummary(profile.email)
          : await getStudentDashboardData(profile.email);
        
        setStats(dashboardData || {});
        toast.success('Dashboard data fetched successfully'); // Show success toast
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to fetch dashboard data'); // Show error toast
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.email, isAdminOrTeacher]);

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <PageAnimation>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <AnimatedText 
              text={`${getGreeting()}, ${profile?.full_name || 'User'}! 😊
              Role: ${profile?.role || 'User'}`} 
              className="text-2xl md:text-3xl font-bold" 
            />
            <p className="text-gray-500 mt-2">
              Here's what's happening {isAdminOrTeacher ? 'in your school' : 'with your academics'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-4 w-full md:w-auto">
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => navigate('/notifications')}>
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button variant="outline" className="flex-1 md:flex-none" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used actions and shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {stats && stats.quickLinks && stats?.quickLinks
                    .filter(link => link.role === 'all' || link.role === (isAdminOrTeacher ? 'admin' : 'student'))
                    .map(link => (
                      <Button
                        key={link.id}
                        variant="outline"
                        className="h-24 flex flex-col items-center justify-center text-center p-2 hover:bg-primary/5 transition-colors"
                        onClick={() => navigate(link.url)}
                      >
                        {getQuickLinkIcon(link.icon)}
                        <span className="mt-2 text-sm font-medium line-clamp-1">{link.title}</span>
                        <span className="text-xs text-gray-500 line-clamp-2">{link.description}</span>
                      </Button>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {isAdminOrTeacher ? (
                <>
                  {stats.totalStudents === 0 ? (
                    <EmptyState />
                  ) : (
                    <StatsCard
                      title="Total Students"
                      value={stats.totalStudents}
                      icon={<Users className="h-4 w-4" />}
                      description={`${stats.totalStudents} active students`}
                      trend={10}
                    />
                  )}
                  <StatsCard
                    title="Total Teachers"
                    value={stats.totalTeachers}
                    icon={<GraduationCap className="h-4 w-4" />}
                    description={`${stats.totalTeachers} active teachers`}
                    trend={5}
                  />
                  <StatsCard
                    title="Fee Collection"
                    value={`₹${stats.totalFeeCollected}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    description={`₹${stats.totalPendingFees} pending`}
                    trend={-2}
                  />
                  <StatsCard
                    title="Average Attendance"
                    value={`${stats.averageAttendance}%`}
                    icon={<CheckCircle className="h-4 w-4" />}
                    description="Overall attendance rate"
                    trend={3}
                  />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Attendance"
                    value={`${stats.attendancePercentage}%`}
                    icon={<CheckCircle className="h-4 w-4" />}
                    description="Your attendance rate"
                    trend={5}
                  />
                  <StatsCard
                    title="Tasks"
                    value={stats.pendingTasks}
                    icon={<AlertCircle className="h-4 w-4" />}
                    description="Pending assignments"
                    trend={-2}
                  />
                  <StatsCard
                    title="Performance"
                    value={`${stats.averageScore}%`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    description="Average score"
                    trend={8}
                  />
                  <StatsCard
                    title="Fees Due"
                    value={`₹${stats.pendingFees}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    description="Outstanding balance"
                    trend={0}
                  />
                </>
              )}
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>{isAdminOrTeacher ? 'Student Performance Trend' : 'Your Performance Trend'}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] w-full">
                    <LineChart
                      data={stats?.performanceMetrics?.studentPerformance}
                      labels={getLast6Months()}
                      label="Performance"
                      color="rgb(59, 130, 246)"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[300px] w-full">
                    <LineChart
                      data={stats?.performanceMetrics?.attendanceTrend}
                      labels={getLast6Months()}
                      label="Attendance"
                      color="rgb(34, 197, 94)"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements and Activities */}
          

            {/* Calendar and Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Your schedule and important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border max-w-full"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-4">Events for {selectedDate.toLocaleDateString()}</h4>
                    <ScrollArea className="h-[200px] w-full rounded-md">
                      <div className="pr-4 space-y-4">
                        {/* Add events for selected date here */}
                        <div className="flex flex-col items-center justify-center h-[150px] text-gray-500">
                          <CalendarIcon className="h-8 w-8 mb-2 opacity-50" />
                          <p>No events scheduled</p>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageAnimation>
  );
}

// Helper Components
function StatsCard({ title, value, icon, description, trend }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
          {trend !== undefined && (
            <Badge variant={trend > 0 ? 'success' : trend < 0 ? 'destructive' : 'secondary'}>
              {trend > 0 ? '+' : ''}{trend}%
            </Badge>
          )}
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-500">{title}</p>
          {description && (
            <p className="text-xs text-gray-400">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getQuickLinkIcon(iconName: string) {
  const icons = {
    'check-square': <CheckSquare className="h-6 w-6" />,
    'book': <Book className="h-6 w-6" />,
    'credit-card': <CreditCard className="h-6 w-6" />,
    'bar-chart': <BarChart className="h-6 w-6" />,
    'users': <Users className="h-6 w-6" />
  };
  return icons[iconName as keyof typeof icons] || <Home className="h-6 w-6" />;
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'warning';
    case 'low': return 'secondary';
    default: return 'default';
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'COMPLETED': return 'success';
    case 'OVERDUE': return 'destructive';
    default: return 'default';
  }
}

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();
}
