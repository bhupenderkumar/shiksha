import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Cake,
  Gift,
  PartyPopper,
  Calendar,
  ChevronRight,
  User,
  Sparkles,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { birthdayService, BirthdayStudent } from '@/services/birthdayService';
import { cn } from '@/lib/utils';

interface BirthdaySidebarProps {
  className?: string;
  collapsed?: boolean;
  onClose?: () => void;
}

export const BirthdaySidebar: React.FC<BirthdaySidebarProps> = ({
  className,
  collapsed = false,
  onClose,
}) => {
  const [todaysBirthdays, setTodaysBirthdays] = useState<BirthdayStudent[]>([]);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<BirthdayStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        setLoading(true);
        const [today, upcoming] = await Promise.all([
          birthdayService.getTodaysBirthdays(),
          birthdayService.getUpcomingBirthdays(7),
        ]);
        setTodaysBirthdays(today);
        setUpcomingBirthdays(upcoming);
      } catch (error) {
        console.error('Error fetching birthdays:', error);
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

  if (collapsed) {
    return (
      <div className={cn('flex flex-col items-center py-4 gap-2', className)}>
        <div className="relative">
          <Cake className="w-6 h-6 text-pink-500" />
          {todaysBirthdays.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
              {todaysBirthdays.length}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        'border-0 shadow-lg bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 overflow-hidden',
        className
      )}
    >
      <CardHeader className="pb-2 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
              <Cake className="w-4 h-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Birthdays
            </span>
          </CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-8 text-pink-300/50">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <ScrollArea className="h-[400px] pr-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Today's Birthdays */}
              {todaysBirthdays.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <PartyPopper className="w-4 h-4 text-yellow-500 animate-bounce" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Today's Celebration
                    </span>
                    <Badge
                      variant="secondary"
                      className="ml-auto bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    >
                      {todaysBirthdays.length}
                    </Badge>
                  </div>
                  {todaysBirthdays.map((student) => (
                    <BirthdayCard
                      key={student.id}
                      student={student}
                      isToday={true}
                    />
                  ))}
                </div>
              )}

              {/* Upcoming Birthdays */}
              {upcomingBirthdays.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      This Week
                    </span>
                    <Badge variant="outline" className="ml-auto">
                      {upcomingBirthdays.length}
                    </Badge>
                  </div>
                  {upcomingBirthdays.map((student) => (
                    <BirthdayCard
                      key={student.id}
                      student={student}
                      isToday={false}
                    />
                  ))}
                </div>
              )}

              {/* No birthdays */}
              {todaysBirthdays.length === 0 && upcomingBirthdays.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Cake className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No birthdays this week
                  </p>
                </div>
              )}

              {/* View All Link */}
              <Link
                to="/birthdays"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 transition-colors group"
              >
                <Gift className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  View All Birthdays
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

interface BirthdayCardProps {
  student: BirthdayStudent;
  isToday: boolean;
}

const BirthdayCard: React.FC<BirthdayCardProps> = ({ student, isToday }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Link
      to={`/birthday/${student.id}`}
      className={cn(
        'block rounded-xl p-3 transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-md',
        isToday
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border border-yellow-200/50 dark:border-yellow-800/30'
          : 'bg-white/70 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800'
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar
            className={cn(
              'w-12 h-12 ring-2 transition-all',
              isToday
                ? 'ring-yellow-400 animate-pulse'
                : 'ring-purple-200 dark:ring-purple-800'
            )}
          >
            <AvatarImage src={student.studentPhotoUrl || undefined} />
            <AvatarFallback
              className={cn(
                'text-sm font-bold',
                isToday
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white'
                  : 'bg-gradient-to-br from-pink-400 to-purple-400 text-white'
              )}
            >
              {getInitials(student.studentName)}
            </AvatarFallback>
          </Avatar>
          {isToday && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs">🎂</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'font-semibold text-sm truncate',
              isToday
                ? 'text-orange-700 dark:text-orange-300'
                : 'text-gray-800 dark:text-gray-200'
            )}
          >
            {student.studentName}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {student.className} {student.classSection}
            </span>
            <span>•</span>
            <span>Turns {student.age + (isToday ? 0 : 1)}</span>
          </div>
          {!isToday && (
            <p className="text-xs text-purple-500 dark:text-purple-400 mt-0.5">
              {student.daysUntilBirthday === 1
                ? 'Tomorrow'
                : `In ${student.daysUntilBirthday} days`}
            </p>
          )}
        </div>

        {isToday && (
          <div className="flex items-center gap-1">
            <span className="text-lg">🎉</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default BirthdaySidebar;
