import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getStudentDashboardData } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bell, Book, CheckCircle, Clock } from 'lucide-react';

const StatCard = ({ stat }) => (
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
        value={typeof stat.value === 'string' ? parseInt(stat.value) : stat.value} 
        className="mt-4"
      />
    </CardContent>
  </Card>
);

const NotificationItem = ({ notification }) => (
  <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
    <div className="flex-shrink-0">
      {notification.type === 'HOMEWORK' && <Book className="w-5 h-5 text-blue-500" />}
      {notification.type === 'ATTENDANCE' && <CheckCircle className="w-5 h-5 text-green-500" />}
      {notification.type === 'FEE' && <Clock className="w-5 h-5 text-amber-500" />}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-foreground truncate">
        {notification.title}
      </p>
      <p className="text-xs text-muted-foreground">
        {new Date(notification.createdAt).toLocaleDateString()}
      </p>
    </div>
    {!notification.isRead && (
      <Badge variant="info" className="flex-shrink-0">
        New
      </Badge>
    )}
  </div>
);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStudentData();
    }
  }, [user]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const dashboardData = await getStudentDashboardData(user!.id);
      setData(dashboardData);
    } catch (error) {
      console.error('Error loading student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const stats = [
    {
      title: "Homework Progress",
      value: `${Math.round((data?.summary.completedHomeworks / data?.summary.totalHomeworks) * 100) || 0}%`,
      icon: Book,
      description: `${data?.summary.completedHomeworks || 0}/${data?.summary.totalHomeworks || 0} completed`,
    },
    {
      title: "Attendance",
      value: `${data?.summary.attendancePercentage || 0}%`,
      icon: CheckCircle,
      description: "Present days",
    },
    {
      title: "Pending Fees",
      value: data?.summary.pendingFees || 0,
      icon: Clock,
      description: "Due payments",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>
        <Badge variant="outline" className="flex items-center space-x-2">
          <Bell className="w-4 h-4" />
          <span>{data?.notifications?.filter((n: any) => !n.isRead).length || 0} new</span>
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </div>

      {/* Recent Activity and Upcoming Tasks */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.notifications?.map((notification: any) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.homeworks
                ?.filter((hw: any) => hw.status === 'PENDING')
                .map((homework: any) => (
                  <div key={homework.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{homework.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(homework.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={homework.status.toLowerCase()}>
                      {homework.status}
                    </Badge>
                  </div>
                ))}
            </div>
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
                {data?.summary.attendancePercentage}%
              </p>
              <p className="text-sm text-muted-foreground">
                Overall Attendance
              </p>
            </div>
            <div className="flex gap-4">
              <Badge variant="success">Present</Badge>
              <Badge variant="destructive">Absent</Badge>
              <Badge variant="warning">Late</Badge>
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
