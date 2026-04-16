import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar as CalendarIcon, Sparkles, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calendarService, type Holiday } from '@/services/calendarService';
import { nextDayPlanService } from '@/services/nextDayPlanService';

interface DashboardCalendarProps {
  classId?: string;
}

export function DashboardCalendar({ classId }: DashboardCalendarProps) {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [tomorrowPlanExists, setTomorrowPlanExists] = useState(false);
  const [todayPlanExists, setTodayPlanExists] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  useEffect(() => {
    loadHolidays();
    if (classId) loadPlanStatus();
  }, [classId]);

  async function loadHolidays() {
    try {
      const year = new Date().getFullYear();
      const yearHolidays = await calendarService.getHolidaysForYear(year);
      setHolidays(yearHolidays);
    } catch {
      // Silently fail — holidays are optional
    }
  }

  async function loadPlanStatus() {
    if (!classId) return;
    try {
      const [todayPlan, tomorrowPlan] = await Promise.all([
        nextDayPlanService.getByClassAndDate(classId, today),
        nextDayPlanService.getByClassAndDate(classId, tomorrow),
      ]);
      setTodayPlanExists(!!todayPlan);
      setTomorrowPlanExists(!!tomorrowPlan);
    } catch {
      // Silently fail
    }
  }

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();
  const monthHolidays = calendarService.getHolidaysForMonth(selectedYear, selectedMonth, holidays);
  const selectedDayHolidays = holidays.filter(h => h.date === selectedDateStr);
  const upcomingHolidays = holidays
    .filter(h => h.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Highlight dates that are holidays
  const holidayDates = holidays.map(h => new Date(h.date));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Schedule, holidays & plan status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-auto">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border max-w-full"
              modifiers={{
                holiday: holidayDates,
              }}
              modifiersClassNames={{
                holiday: 'bg-red-100 text-red-800 font-bold',
              }}
            />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold mb-3">
              {selectedDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h4>
            <ScrollArea className="h-[200px] w-full rounded-md">
              <div className="pr-4 space-y-3">
                {/* Holidays for selected date */}
                {selectedDayHolidays.length > 0 ? (
                  selectedDayHolidays.map((h, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded bg-red-50">
                      <span>🔴</span>
                      <div>
                        <p className="font-medium text-sm">{h.name}</p>
                        <p className="text-xs text-muted-foreground">{h.primary_type}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No holidays on this date</p>
                )}

                {/* Upcoming holidays */}
                {upcomingHolidays.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-muted-foreground mb-1">UPCOMING</p>
                    {upcomingHolidays.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm py-1">
                        <span className="text-xs">
                          {h.date === today ? '🟢' : '🟠'}
                        </span>
                        <span>{h.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(h.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Plan status */}
                {classId && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">AI PLANNER</p>
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="w-4 h-4" />
                      <span>Today's Plan:</span>
                      {todayPlanExists ? (
                        <Badge className="bg-green-100 text-green-800 text-xs">✅ Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not set</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Tomorrow's Plan:</span>
                      {tomorrowPlanExists ? (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">✅ Ready</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Not set</Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => navigate('/next-day-plan')}
                    >
                      View AI Planner →
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
