import { useEffect, useState } from 'react';
import { useProfileAccess } from '@/services/profileService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { 
  Book, Users,
  CheckCircle, AlertCircle, GraduationCap,
  Bell, Settings, DollarSign,
  TrendingUp, School, CreditCard, CheckSquare,
  CalendarDays, FileText, ArrowRight,
  Sparkles, ClipboardList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { PageHeader } from '@/components/ui/page-header';
import { cn } from '@/lib/utils';
import { getDashboardSummary, getStudentDashboardData } from '@/services/dashboardService';
import { LineChart } from '@/components/ui/line-chart';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import { DashboardCalendar } from '@/components/DashboardCalendar';

export default function Dashboard() {
  const { profile, isAdminOrTeacher } = useProfileAccess();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
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
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
        setStats({});
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profile?.email, isAdminOrTeacher]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <PageHeader
          title={`${getGreeting()}, ${profile?.full_name || 'User'}!`}
          subtitle={isAdminOrTeacher ? 'School Overview' : 'My Dashboard'}
          icon={School}
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/notifications')}>
                <Bell className="h-4 w-4 mr-1.5" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/settings')}>
                <Settings className="h-4 w-4 mr-1.5" />
                Settings
              </Button>
            </div>
          }
        />

        {/* Role-specific content */}
        {isAdminOrTeacher ? (
          <AdminTeacherDashboard stats={stats} navigate={navigate} />
        ) : (
          <ParentStudentDashboard stats={stats} navigate={navigate} />
        )}

        {/* Calendar - shared */}
        <DashboardCalendar />
      </div>
  );
}

function AdminTeacherDashboard({ stats, navigate }: { stats: any; navigate: any }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <MetricCard icon={<Users className="h-5 w-5 text-blue-600" />} label="Students" value={stats.totalStudents || 0} bgColor="bg-blue-50" onClick={() => navigate('/students')} />
        <MetricCard icon={<GraduationCap className="h-5 w-5 text-purple-600" />} label="Teachers" value={stats.totalTeachers || 0} bgColor="bg-purple-50" />
        <MetricCard icon={<School className="h-5 w-5 text-indigo-600" />} label="Classes" value={stats.totalClasses || 0} bgColor="bg-indigo-50" />
        <MetricCard icon={<CheckCircle className="h-5 w-5 text-green-600" />} label="Attendance" value={`${stats.averageAttendance || 0}%`} bgColor="bg-green-50" onClick={() => navigate('/attendance')} />
        <MetricCard icon={<Book className="h-5 w-5 text-orange-600" />} label="Pending HW" value={stats.pendingHomeworks || 0} bgColor="bg-orange-50" onClick={() => navigate('/homework')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-medium">Total Collected</p>
                <p className="text-xl font-bold text-emerald-900">{formatCurrency(stats.totalFeeCollected)}</p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg"><DollarSign className="h-5 w-5 text-emerald-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Total Pending</p>
                <p className="text-xl font-bold text-amber-900">{formatCurrency(stats.totalPendingFees)}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg"><CreditCard className="h-5 w-5 text-amber-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">This Month</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(stats.currentMonthFeeCollected)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg"><CalendarDays className="h-5 w-5 text-blue-600" /></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/fees')}>
          <CardContent className="p-4 flex items-center justify-center h-full">
            <div className="text-center">
              <CreditCard className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
              <p className="text-sm font-medium text-muted-foreground">Manage Fees</p>
              <ArrowRight className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <QuickAction icon={<CheckSquare className="h-5 w-5" />} label="Attendance" onClick={() => navigate('/attendance')} color="text-green-600" />
            <QuickAction icon={<Book className="h-5 w-5" />} label="Homework" onClick={() => navigate('/homework')} color="text-blue-600" />
            <QuickAction icon={<ClipboardList className="h-5 w-5" />} label="Classwork" onClick={() => navigate('/classwork')} color="text-purple-600" />
            <QuickAction icon={<CreditCard className="h-5 w-5" />} label="Fees" onClick={() => navigate('/fees')} color="text-amber-600" />
            <QuickAction icon={<Sparkles className="h-5 w-5" />} label="AI Planner" onClick={() => navigate('/next-day-plan')} color="text-pink-600" />
            <QuickAction icon={<Users className="h-5 w-5" />} label="Students" onClick={() => navigate('/students')} color="text-indigo-600" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Attendance Trend</CardTitle>
            <CardDescription>Last 6 months overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <LineChart data={stats?.performanceMetrics?.attendanceTrend || []} labels={getLast6Months()} label="Attendance %" color="rgb(34, 197, 94)" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fee Collection</CardTitle>
            <CardDescription>Monthly collection trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <LineChart data={stats?.performanceMetrics?.feeCollection || []} labels={getLast6Months()} label="Amount (₹)" color="rgb(234, 179, 8)" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upcoming Homework</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.upcomingDeadlines?.length > 0 ? (
              <div className="space-y-3">
                {stats.upcomingDeadlines.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-orange-100 rounded"><Book className="h-4 w-4 text-orange-600" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.title}</p>
                        <p className="text-xs text-muted-foreground">Due: {new Date(d.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                      </div>
                    </div>
                    <Badge variant={d.status === 'PENDING' ? 'warning' : 'success'} className="text-xs shrink-0">{d.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder icon={<Book className="h-8 w-8" />} message="No pending homework" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Classwork</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/classwork')}>View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentClasswork?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentClasswork.map((cw: any) => (
                  <div key={cw.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 bg-purple-100 rounded"><FileText className="h-4 w-4 text-purple-600" /></div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{cw.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {cw.workType && <span className="capitalize">{cw.workType} · </span>}
                          {cw.date ? new Date(cw.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                        </p>
                      </div>
                    </div>
                    {cw.completionStatus && (
                      <Badge variant={cw.completionStatus === 'completed' ? 'success' : 'secondary'} className="text-xs shrink-0 capitalize">{cw.completionStatus}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder icon={<ClipboardList className="h-8 w-8" />} message="No recent classwork" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ParentStudentDashboard({ stats, navigate }: { stats: any; navigate: any }) {
  if (!stats) return null;

  const hasStudentData = stats.studentName || stats.attendancePercentage || stats.totalHomeworks;

  return (
    <div className="space-y-6">
      {stats.studentName ? (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full"><GraduationCap className="h-6 w-6 text-blue-700" /></div>
            <div>
              <p className="font-semibold text-lg">{stats.studentName}</p>
              {stats.className && <p className="text-sm text-blue-700">{stats.className}</p>}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-full"><GraduationCap className="h-6 w-6 text-slate-600" /></div>
            <div>
              <p className="font-semibold text-lg">Welcome!</p>
              <p className="text-sm text-slate-600">Your student profile is being set up</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <MetricCard icon={<CheckCircle className="h-5 w-5 text-green-600" />} label="Attendance" value={`${stats.attendancePercentage || 0}%`} bgColor="bg-green-50" subtitle={stats.attendancePercentage >= 75 ? 'Good' : 'Needs improvement'} />
        <MetricCard icon={<AlertCircle className="h-5 w-5 text-orange-600" />} label="Pending HW" value={stats.pendingHomeworks || 0} bgColor="bg-orange-50" subtitle={`of ${stats.totalHomeworks || 0} total`} onClick={() => navigate('/homework')} />
        <MetricCard icon={<DollarSign className="h-5 w-5 text-red-600" />} label="Fees Due" value={formatCurrency(stats.pendingFees)} bgColor="bg-red-50" onClick={() => navigate('/fees')} />
        <MetricCard icon={<TrendingUp className="h-5 w-5 text-blue-600" />} label="Total HW" value={stats.totalHomeworks || 0} bgColor="bg-blue-50" />
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Attendance Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Overall Attendance</span>
              <span className="text-sm font-semibold">{stats.attendancePercentage || 0}%</span>
            </div>
            <Progress value={stats.attendancePercentage || 0} className="h-3" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Present</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Absent</span>
            </div>
          </div>
          {stats.performanceMetrics?.attendanceTrend && (
            <div className="mt-4 h-[200px]">
              <LineChart data={stats.performanceMetrics.attendanceTrend} labels={getLast6Months()} label="Attendance %" color="rgb(34, 197, 94)" />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickAction icon={<Book className="h-5 w-5" />} label="Homework" onClick={() => navigate('/homework')} color="text-blue-600" />
            <QuickAction icon={<ClipboardList className="h-5 w-5" />} label="Classwork" onClick={() => navigate('/classwork')} color="text-purple-600" />
            <QuickAction icon={<CreditCard className="h-5 w-5" />} label="Pay Fees" onClick={() => navigate('/fees')} color="text-amber-600" />
            <QuickAction icon={<CheckCircle className="h-5 w-5" />} label="Attendance" onClick={() => navigate('/attendance')} color="text-green-600" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Homework</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/homework')}>View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentHomework?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentHomework.map((hw: any) => (
                  <div key={hw.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{hw.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'N/A'}</p>
                    </div>
                    <Badge variant={hw.status === 'PENDING' ? 'warning' : hw.status === 'COMPLETED' ? 'success' : 'destructive'} className="text-xs shrink-0">{hw.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder icon={<Book className="h-8 w-8" />} message="No homework assigned" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Classwork</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/classwork')}>View All <ArrowRight className="h-3.5 w-3.5 ml-1" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentClasswork?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentClasswork.map((cw: any) => (
                  <div key={cw.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{cw.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cw.workType && <span className="capitalize">{cw.workType} · </span>}
                        {cw.date ? new Date(cw.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}
                      </p>
                    </div>
                    {cw.completionStatus && (
                      <Badge variant={cw.completionStatus === 'completed' ? 'success' : 'secondary'} className="text-xs shrink-0 capitalize">{cw.completionStatus}</Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <EmptyPlaceholder icon={<ClipboardList className="h-8 w-8" />} message="No recent classwork" />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, bgColor, subtitle, onClick }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor: string;
  subtitle?: string;
  onClick?: () => void;
}) {
  return (
    <Card className={cn("transition-all", onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5")} onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("p-2 rounded-lg", bgColor)}>{icon}</div>
          {onClick && <ArrowRight className="h-4 w-4 text-muted-foreground" />}
        </div>
        <p className="text-2xl font-bold mt-2">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subtitle && <p className="text-xs text-muted-foreground/70 mt-0.5">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

function QuickAction({ icon, label, onClick, color }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-1.5 hover:bg-muted/50 transition-colors" onClick={onClick}>
      <span className={color}>{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </Button>
  );
}

function EmptyPlaceholder({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
      {icon}
      <p className="text-sm mt-2">{message}</p>
    </div>
  );
}

function formatCurrency(amount: number | undefined | null): string {
  if (!amount) return '\u20B90';
  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toLocaleString('default', { month: 'short' });
  }).reverse();
}
