import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Cake,
  Gift,
  PartyPopper,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  User,
  Sparkles,
  CalendarDays,
  Users,
  Share2,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { birthdayService, BirthdayStudent } from '@/services/birthdayService';
import { SCHOOL_INFO } from '@/lib/constants';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const BirthdaysPage: React.FC = () => {
  const [allStudents, setAllStudents] = useState<BirthdayStudent[]>([]);
  const [todaysBirthdays, setTodaysBirthdays] = useState<BirthdayStudent[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        setLoading(true);
        const [all, today, upcoming] = await Promise.all([
          birthdayService.getAllStudentsWithBirthday(),
          birthdayService.getTodaysBirthdays(),
          birthdayService.getUpcomingBirthdays(30),
        ]);
        setAllStudents(all);
        setTodaysBirthdays(today);
        setUpcomingBirthdays(upcoming);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
        toast.error('Failed to load birthdays');
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleShare = async (student: BirthdayStudent) => {
    const shareUrl = `${window.location.origin}/birthday/${student.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Birthday link copied!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  // Filter students by search and month
  const getFilteredStudents = () => {
    let filtered = allStudents;

    if (searchQuery) {
      filtered = filtered.filter((s) =>
        s.studentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    filtered = filtered.filter(
      (s) => new Date(s.dateOfBirth).getMonth() === selectedMonth
    );

    return filtered.sort((a, b) => {
      const dayA = new Date(a.dateOfBirth).getDate();
      const dayB = new Date(b.dateOfBirth).getDate();
      return dayA - dayB;
    });
  };

  const filteredStudents = getFilteredStudents();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-12 h-12 mx-auto" />
          <p className="text-gray-500">Loading birthdays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Cake className="w-10 h-10" />
            <h1 className="text-3xl sm:text-4xl font-bold">Birthday Celebrations</h1>
            <PartyPopper className="w-10 h-10" />
          </div>
          <p className="text-center text-white/80">
            Celebrate special days with our {SCHOOL_INFO.name} family! 🎉
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-200 dark:bg-yellow-800 flex items-center justify-center">
                <Cake className="w-6 h-6 text-yellow-600 dark:text-yellow-300" />
              </div>
              <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                {todaysBirthdays.length}
              </p>
              <p className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Today</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-300" />
              </div>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {upcomingBirthdays.length}
              </p>
              <p className="text-sm text-purple-600/80 dark:text-purple-400/80">This Month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {allStudents.length}
              </p>
              <p className="text-sm text-blue-600/80 dark:text-blue-400/80">Total Students</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 border-0">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                <Gift className="w-6 h-6 text-green-600 dark:text-green-300" />
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {MONTHS[new Date().getMonth()]}
              </p>
              <p className="text-sm text-green-600/80 dark:text-green-400/80">Current Month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-800 shadow-sm">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Cake className="w-4 h-4 mr-2" />
              Today ({todaysBirthdays.length})
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              By Month
            </TabsTrigger>
          </TabsList>

          {/* Today's Birthdays */}
          <TabsContent value="today">
            {todaysBirthdays.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {todaysBirthdays.map((student) => (
                  <BirthdayStudentCard
                    key={student.id}
                    student={student}
                    isToday={true}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Cake className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Birthdays Today
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Check out upcoming birthdays to see who's celebrating soon!
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Upcoming Birthdays */}
          <TabsContent value="upcoming">
            {upcomingBirthdays.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingBirthdays.map((student) => (
                  <BirthdayStudentCard
                    key={student.id}
                    student={student}
                    isToday={false}
                    onShare={handleShare}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Upcoming Birthdays
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No birthdays in the next 30 days.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* By Month */}
          <TabsContent value="calendar">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Search by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(v) => setSelectedMonth(parseInt(v))}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <CalendarDays className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={month} value={index.toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {filteredStudents.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => (
                  <BirthdayStudentCard
                    key={student.id}
                    student={student}
                    isToday={student.isBirthdayToday}
                    onShare={handleShare}
                    showDate={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Search className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    No Results Found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    No birthdays found for {MONTHS[selectedMonth]}
                    {searchQuery && ` matching "${searchQuery}"`}.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface BirthdayStudentCardProps {
  student: BirthdayStudent;
  isToday: boolean;
  onShare: (student: BirthdayStudent) => void;
  showDate?: boolean;
}

const BirthdayStudentCard: React.FC<BirthdayStudentCardProps> = ({
  student,
  isToday,
  onShare,
  showDate = false,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-xl',
        isToday
          ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800'
          : 'hover:border-purple-200 dark:hover:border-purple-800'
      )}
    >
      {isToday && (
        <div className="h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400" />
      )}
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Link to={`/birthday/${student.id}`}>
            <div className="relative">
              <Avatar
                className={cn(
                  'w-16 h-16 ring-2 transition-all duration-300 group-hover:scale-110',
                  isToday
                    ? 'ring-yellow-400 shadow-lg shadow-yellow-200'
                    : 'ring-purple-200 dark:ring-purple-800'
                )}
              >
                <AvatarImage src={student.studentPhotoUrl || undefined} />
                <AvatarFallback
                  className={cn(
                    'text-lg font-bold',
                    isToday
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white'
                      : 'bg-gradient-to-br from-pink-400 to-purple-400 text-white'
                  )}
                >
                  {getInitials(student.studentName)}
                </AvatarFallback>
              </Avatar>
              {isToday && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                  <span className="text-sm">🎂</span>
                </div>
              )}
            </div>
          </Link>

          <div className="flex-1 min-w-0">
            <Link to={`/birthday/${student.id}`}>
              <h3
                className={cn(
                  'font-semibold truncate hover:underline',
                  isToday
                    ? 'text-orange-700 dark:text-orange-300'
                    : 'text-gray-800 dark:text-gray-200'
                )}
              >
                {student.studentName}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Class {student.className} {student.classSection}
            </p>
            {showDate && (
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                {format(new Date(student.dateOfBirth), 'MMMM d')}
              </p>
            )}
            {!isToday && !showDate && (
              <p className="text-sm text-purple-500 dark:text-purple-400 mt-1">
                {student.daysUntilBirthday === 1
                  ? 'Tomorrow!'
                  : `In ${student.daysUntilBirthday} days`}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  isToday
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                    : ''
                )}
              >
                Turns {student.age + (isToday ? 0 : 1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onShare(student)}
            >
              <Share2 className="w-4 h-4" />
            </Button>
            <Link to={`/birthday/${student.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Eye className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthdaysPage;
