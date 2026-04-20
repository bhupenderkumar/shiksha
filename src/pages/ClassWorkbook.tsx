import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BookOpen, Mic, Pencil, FileText, Camera, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';

export default function ClassWorkbook() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [dailyData, setDailyData] = useState<Record<string, { classwork: any[]; homework: any[] }>>({});

  // Compute week boundaries
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1 + offset * 7); // Monday
    const dates: string[] = [];
    for (let i = 0; i < 6; i++) { // Mon-Sat
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekOffset);
  const weekLabel = `${new Date(weekDates[0]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} — ${new Date(weekDates[weekDates.length - 1]).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) loadWeekData();
  }, [selectedClass, weekOffset]);

  async function loadClasses() {
    try {
      const { data } = await supabase
        .schema(SCHEMA)
        .from('Class')
        .select('id, name, section')
        .order('name');
      setClasses(data || []);
      if (data && data.length > 0) setSelectedClass(data[0].id);
    } catch {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }

  async function loadWeekData() {
    try {
      setLoading(true);
      const startDate = weekDates[0];
      const endDate = weekDates[weekDates.length - 1];

      const [classworkRes, homeworkRes] = await Promise.all([
        supabase
          .schema(SCHEMA)
          .from('Classwork')
          .select('*, attachments:File(*), subject:Subject(id, name)')
          .eq('classId', selectedClass)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true }),
        supabase
          .schema(SCHEMA)
          .from('Homework')
          .select('*, subject:Subject(id, name)')
          .eq('classId', selectedClass)
          .gte('createdAt', `${startDate}T00:00:00`)
          .lte('createdAt', `${endDate}T23:59:59`)
          .order('createdAt', { ascending: true }),
      ]);

      const grouped: Record<string, { classwork: any[]; homework: any[] }> = {};
      for (const date of weekDates) {
        grouped[date] = { classwork: [], homework: [] };
      }

      (classworkRes.data || []).forEach((cw: any) => {
        const date = cw.date?.split('T')[0] || cw.date;
        if (grouped[date]) grouped[date].classwork.push(cw);
      });

      (homeworkRes.data || []).forEach((hw: any) => {
        const date = hw.createdAt?.split('T')[0];
        if (date && grouped[date]) grouped[date].homework.push(hw);
      });

      setDailyData(grouped);
    } catch {
      toast.error('Failed to load week data');
    } finally {
      setLoading(false);
    }
  }

  if (loading && classes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <PageHeader
        title="Class Workbook"
        subtitle="Weekly view of all classwork & homework"
        icon={<BookOpen className="text-primary-500" />}
        action={
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name} {c.section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(prev => prev - 1)}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </Button>
          <span className="font-medium">{weekLabel}</span>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(prev => prev + 1)} disabled={weekOffset >= 0}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Days */}
        {loading ? (
          <div className="flex justify-center p-8"><LoadingSpinner /></div>
        ) : (
          <div className="space-y-4">
            {weekDates.map(date => {
              const data = dailyData[date] || { classwork: [], homework: [] };
              const isToday = date === new Date().toISOString().split('T')[0];
              const dayName = new Date(date).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
              const hasData = data.classwork.length > 0 || data.homework.length > 0;
              const photoCount = data.classwork.reduce((sum: number, c: any) => sum + (c.attachments?.length || 0), 0);

              return (
                <Card key={date} className={isToday ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {isToday && <Badge className="bg-primary text-white text-xs">Today</Badge>}
                        📅 {dayName}
                      </CardTitle>
                      {photoCount > 0 && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Camera className="w-3 h-3" /> {photoCount} photos
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {!hasData ? (
                      <p className="text-sm text-muted-foreground py-2">No work recorded</p>
                    ) : (
                      <div className="space-y-2">
                        {/* Group by subject */}
                        {(() => {
                          const subjectGroups = new Map<string, { name: string; classwork: any[]; homework: any[] }>();

                          data.classwork.forEach((cw: any) => {
                            const key = cw.subjectId || 'general';
                            const name = cw.subject?.name || 'General';
                            if (!subjectGroups.has(key)) subjectGroups.set(key, { name, classwork: [], homework: [] });
                            subjectGroups.get(key)!.classwork.push(cw);
                          });

                          data.homework.forEach((hw: any) => {
                            const key = hw.subjectId || 'general';
                            const name = hw.subject?.name || 'General';
                            if (!subjectGroups.has(key)) subjectGroups.set(key, { name, classwork: [], homework: [] });
                            subjectGroups.get(key)!.homework.push(hw);
                          });

                          return Array.from(subjectGroups.entries()).map(([key, group]) => (
                            <div key={key} className="border-l-2 border-primary/30 pl-3 py-1">
                              <p className="font-medium text-sm">{group.name}</p>
                              {group.classwork.map((cw: any) => (
                                <div key={cw.id} className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                                  {cw.workType === 'oral' ? (
                                    <Mic className="w-3 h-3 text-blue-500" />
                                  ) : (
                                    <Pencil className="w-3 h-3 text-purple-500" />
                                  )}
                                  <span>{cw.title}</span>
                                  {cw.attachments?.length > 0 && (
                                    <Camera className="w-3 h-3 text-green-500 ml-1" />
                                  )}
                                </div>
                              ))}
                              {group.homework.map((hw: any) => (
                                <div key={hw.id} className="flex items-center gap-1 text-xs text-muted-foreground ml-2">
                                  <FileText className="w-3 h-3 text-green-500" />
                                  <span>HW: {hw.title}</span>
                                  <Badge variant="outline" className="text-xs h-4 ml-1">
                                    {hw.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
  );
}
