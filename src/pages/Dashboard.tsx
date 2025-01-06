import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getDashboardSummary } from '@/services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Bell, Book, Calculator, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';
import StudentDashboard from './StudentDashboard';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.role !== 'STUDENT') {
      loadDashboardData();
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getDashboardSummary(user!.id);
      setSummary(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (profile?.role === 'STUDENT') {
    return <StudentDashboard />;
  }

  const stats = [
    {
      title: "Total Students",
      value: summary?.totalStudents || 0,
      icon: Users,
      description: "Active students",
      trend: "up",
    },
    {
      title: "Total Teachers",
      value: summary?.totalTeachers || 0,
      icon: Book,
      description: "Teaching staff",
      trend: "stable",
    },
    {
      title: "Active Classes",
      value: summary?.totalClasses || 0,
      icon: Calculator,
      description: "Running classes",
      trend: "up",
    },
    {
      title: "Average Attendance",
      value: `${summary?.averageAttendance || 0}%`,
      icon: Clock,
      description: "Daily attendance",
      trend: "down",
    },
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">School Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </Badge>
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>{summary?.pendingHomeworks || 0} Pending</span>
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
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
        ))}
      </div>

      {/* Activity and Calendar Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary?.recentActivities?.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
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
              selected={new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
