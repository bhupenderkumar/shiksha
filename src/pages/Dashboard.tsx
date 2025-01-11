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
  PieChart, TrendingUp, School, BookCheck
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
            <p className="text-gray-500 mt-2">
              Here's what's happening {isAdminOrTeacher ? 'in your school' : 'with your academics'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Stats Section */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isAdminOrTeacher ? (
                  <>
                    <StatsCard
                      title="Total Students"
                      value={stats.totalStudents || 0}
                      icon={<Users className="h-4 w-4" />}
                      description={`${stats.totalStudents} active students`}
                      color="blue"
                    />
                    <StatsCard
                      title="Total Teachers"
                      value={stats.totalTeachers || 0}
                      icon={<GraduationCap className="h-4 w-4" />}
                      description={`${stats.totalTeachers} active teachers`}
                      color="green"
                    />
                    <StatsCard
                      title="Total Classes"
                      value={stats.totalClasses || 0}
                      icon={<School className="h-4 w-4" />}
                      description={`${stats.totalClasses} active classes`}
                      color="purple"
                    />
                    <StatsCard
                      title="Average Attendance"
                      value={`${stats.averageAttendance}%`}
                      icon={<CheckCircle className="h-4 w-4" />}
                      description="Overall attendance rate"
                      color="yellow"
                    />
                  </>
                ) : (
                  <>
                    <StatsCard
                      title="Attendance"
                      value={`${stats.attendancePercentage}%`}
                      icon={<CheckCircle className="h-4 w-4" />}
                      description="Your attendance rate"
                      color="blue"
                    />
                    <StatsCard
                      title="Pending Tasks"
                      value={stats.pendingTasks || 0}
                      icon={<AlertCircle className="h-4 w-4" />}
                      description={`${stats.pendingTasks} tasks to complete`}
                      color="yellow"
                    />
                    <StatsCard
                      title="Average Score"
                      value={`${stats.averageScore}%`}
                      icon={<TrendingUp className="h-4 w-4" />}
                      description="Your performance"
                      color="green"
                    />
                    <StatsCard
                      title="Pending Fees"
                      value={`₹${stats.pendingFees || 0}`}
                      icon={<DollarSign className="h-4 w-4" />}
                      description="Outstanding balance"
                      color="red"
                    />
                  </>
                )}
              </div>

              {/* Admin Additional Stats */}
              {isAdminOrTeacher && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fee Collection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Total Collected</span>
                            <span className="font-bold">₹{stats.totalFeeCollected}</span>
                          </div>
                          <Progress value={
                            stats.totalFeeCollected + stats.totalPendingFees > 0
                              ? (stats.totalFeeCollected / (stats.totalFeeCollected + stats.totalPendingFees)) * 100
                              : 0
                          } />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span>Pending Collection</span>
                            <span className="font-bold text-red-500">₹{stats.totalPendingFees}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Module Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Attendance Records</span>
                          <span className="font-bold">{stats.moduleStats.attendance}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Homework Assignments</span>
                          <span className="font-bold">{stats.moduleStats.homework}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Classwork Records</span>
                          <span className="font-bold">{stats.moduleStats.classwork}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Fee Transactions</span>
                          <span className="font-bold">{stats.moduleStats.fees}</span>
                        </div>
                      </div>
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
              )}

              {/* Activities and Deadlines */}
              <div className="grid gap-4 md:grid-cols-2">
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
                            icon={getActivityIcon(activity.type)}
                            status={activity.status}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Bell} message="No recent activities" />
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
                            status={deadline.status}
                          />
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={Clock} message="No upcoming deadlines" />
                    )}
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

// Helper Components
function StatsCard({ title, value, icon, description, color = 'blue' }: any) {
  const colorVariants = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className={cn('p-3 rounded-full', colorVariants[color as keyof typeof colorVariants])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ title, date, icon, status, onClick }: any) {
  const statusColors = {
    completed: 'text-green-500',
    pending: 'text-yellow-500',
    overdue: 'text-red-500'
  };

  return (
    <div 
      className={cn(
        'flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors',
        onClick && 'cursor-pointer'
      )}
      onClick={onClick}
    >
      <div className="bg-gray-100 p-2 rounded-full">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500">
          {new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
      {status && (
        <span className={cn('text-sm font-medium', statusColors[status as keyof typeof statusColors])}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: any; message: string }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <Icon className="h-12 w-12 mx-auto mb-4 opacity-20" />
      <p>{message}</p>
    </div>
  );
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'homework':
      return <Book className="h-4 w-4" />;
    case 'attendance':
      return <CheckCircle className="h-4 w-4" />;
    case 'fee':
      return <DollarSign className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}
