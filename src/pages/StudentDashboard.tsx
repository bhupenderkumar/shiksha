import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getStudentDashboardData } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Bell, Book, CheckCircle, Clock, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ stat }: { stat: any }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {stat.title}
      </CardTitle>
      <stat.icon className="w-4 h-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stat.value}</div>
      <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
      <Progress 
        value={typeof stat.value === 'string' ? parseInt(stat.value) || 0 : (stat.value || 0)} 
        className="mt-4"
      />
    </CardContent>
  </Card>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getStudentDashboardData(user!.email!);
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
      setData({});
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = [
    {
      title: "Homework Progress",
      value: data?.totalHomeworks
        ? `${Math.round(((data.totalHomeworks - (data.pendingHomeworks || 0)) / data.totalHomeworks) * 100)}%`
        : '0%',
      icon: Book,
      description: `${(data?.totalHomeworks || 0) - (data?.pendingHomeworks || 0)}/${data?.totalHomeworks || 0} completed`,
    },
    {
      title: "Attendance",
      value: `${data?.attendancePercentage || 0}%`,
      icon: CheckCircle,
      description: "Present days",
    },
    {
      title: "Pending Fees",
      value: data?.pendingFees ? `₹${data.pendingFees.toLocaleString('en-IN')}` : '₹0',
      icon: Clock,
      description: "Due payments",
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">
            {data?.studentName ? `Welcome, ${data.studentName}!` : 'Welcome back!'}
          </p>
        </div>
        {data?.className && (
          <Badge variant="outline" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            <span>{data.className}</span>
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Recent Activity and Upcoming Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Homework
              <button onClick={() => navigate('/homework')} className="text-sm text-primary font-normal hover:underline">
                View All
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentHomework?.length > 0 ? (
              data.recentHomework.map((hw: any) => (
                <div key={hw.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{hw.title}</p>
                    {hw.dueDate && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(hw.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Badge variant={hw.status === 'PENDING' ? 'destructive' : 'default'}>
                    {hw.status || 'Unknown'}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No homework yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Classwork
              <button onClick={() => navigate('/classwork')} className="text-sm text-primary font-normal hover:underline">
                View All
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recentClasswork?.length > 0 ? (
              data.recentClasswork.map((cw: any) => (
                <div key={cw.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{cw.title}</p>
                    {cw.date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(cw.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {cw.workType && (
                    <Badge variant="outline">{cw.workType}</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No classwork yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {data?.attendancePercentage || 0}%
              </p>
              <p className="text-sm text-muted-foreground">
                Overall Attendance
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="default">Present</Badge>
              <Badge variant="destructive">Absent</Badge>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>
    </div>
  );
}
