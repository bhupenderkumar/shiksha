import React from 'react';
import { Calendar, Clock, School, BookOpen, Download, Share2, Home, MessageCircle, Mail, Phone, Trophy, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ExamScheduleRow {
  date: string;
  day: string;
  type: 'exam' | 'break' | 'holiday' | 'result';
  preNursery: string;
  nursery: string;
  kg: string;
  classI: string;
  classII: string;
  classIII: string;
  classIV: string;
  classV: string;
  note?: string;
}

const examSchedule: ExamScheduleRow[] = [
  {
    date: '09/03/2026',
    day: 'Monday',
    type: 'exam',
    preNursery: 'English',
    nursery: 'English',
    kg: 'English',
    classI: 'English',
    classII: 'English',
    classIII: 'English',
    classIV: 'English',
    classV: 'English',
  },
  {
    date: '10/03/2026',
    day: 'Tuesday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '11/03/2026',
    day: 'Wednesday',
    type: 'exam',
    preNursery: 'Hindi',
    nursery: 'Hindi',
    kg: 'Hindi',
    classI: 'Hindi',
    classII: 'Hindi',
    classIII: 'Hindi',
    classIV: 'Hindi',
    classV: 'Hindi',
  },
  {
    date: '12/03/2026',
    day: 'Thursday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '13/03/2026',
    day: 'Friday',
    type: 'exam',
    preNursery: 'Math',
    nursery: 'Math',
    kg: 'Math',
    classI: 'Math',
    classII: 'Math',
    classIII: 'Math',
    classIV: 'Math',
    classV: 'Math',
  },
  {
    date: '14/03/2026',
    day: 'Saturday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '15/03/2026',
    day: 'Sunday',
    type: 'holiday',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Sunday Holiday',
  },
  {
    date: '16/03/2026',
    day: 'Monday',
    type: 'exam',
    preNursery: 'EVS',
    nursery: 'EVS',
    kg: 'EVS',
    classI: 'EVS',
    classII: 'EVS',
    classIII: 'EVS',
    classIV: 'EVS',
    classV: 'EVS',
  },
  {
    date: '17/03/2026',
    day: 'Tuesday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '18/03/2026',
    day: 'Wednesday',
    type: 'exam',
    preNursery: 'Computer',
    nursery: 'Computer',
    kg: 'Computer',
    classI: 'Computer',
    classII: 'Computer & Science',
    classIII: 'Computer & Science',
    classIV: 'Computer & Science',
    classV: 'Computer & Science',
  },
  {
    date: '19/03/2026',
    day: 'Thursday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '20/03/2026',
    day: 'Friday',
    type: 'exam',
    preNursery: 'Drawing & GK',
    nursery: 'Drawing & GK',
    kg: 'Drawing & GK',
    classI: 'Drawing & GK',
    classII: 'Drawing & GK',
    classIII: 'Drawing & GK',
    classIV: 'Drawing & GK',
    classV: 'Drawing & GK',
  },
  {
    date: '21/03/2026',
    day: 'Saturday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '22/03/2026',
    day: 'Sunday',
    type: 'holiday',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Sunday Holiday',
  },
  {
    date: '23/03/2026',
    day: 'Monday',
    type: 'exam',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: 'Sanskrit Intro',
    classII: 'Sanskrit',
    classIII: 'Sanskrit',
    classIV: 'Sanskrit',
    classV: 'Sanskrit',
  },
  {
    date: '24/03/2026',
    day: 'Tuesday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '25/03/2026',
    day: 'Wednesday',
    type: 'exam',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: 'Mental Math',
    classIII: 'Mental Math',
    classIV: 'Mental Math',
    classV: 'Mental Math',
  },
  {
    date: '26/03/2026',
    day: 'Thursday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Preparation Day',
  },
  {
    date: '27/03/2026',
    day: 'Friday',
    type: 'exam',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: 'Yoga / Vocational / Devotional',
    classIII: 'Yoga / Vocational / Devotional',
    classIV: 'Yoga / Vocational / Devotional',
    classV: 'Yoga / Vocational / Devotional',
  },
  {
    date: '28/03/2026',
    day: 'Saturday',
    type: 'break',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Break',
  },
  {
    date: '29/03/2026',
    day: 'Sunday',
    type: 'holiday',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: '-',
    classIII: '-',
    classIV: '-',
    classV: '-',
    note: 'Sunday Holiday',
  },
  {
    date: '31/03/2026',
    day: 'Tuesday',
    type: 'result',
    preNursery: '🎉 Result',
    nursery: '🎉 Result',
    kg: '🎉 Result',
    classI: '🎉 Result',
    classII: '🎉 Result',
    classIII: '🎉 Result',
    classIV: '🎉 Result',
    classV: '🎉 Result',
    note: 'Final Year Result Day',
  },
];

const FinalDateSheet: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: `${SCHOOL_INFO.name} - Final Year Exam Date Sheet 2026`,
      text: `Check out the Final Year examination schedule for ${SCHOOL_INFO.name}. Exams start from 9th March 2026. Results on 31st March 2026!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const examDays = examSchedule.filter((r) => r.type === 'exam');
  const totalExamDays = examDays.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Professional Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b-4 border-red-600 shadow-lg print:shadow-none">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* School Branding */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-600 to-rose-700 rounded-lg flex items-center justify-center shadow-xl print:border-2 print:border-red-600">
                <School className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-red-600 dark:text-red-400 font-medium text-sm md:text-base italic">
                  {SCHOOL_INFO.tagline}
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                  <span className="inline-block w-4 h-4">📍</span>
                  Saurabh Vihar, Jaitpur, Badarpur, New Delhi - 110044
                </p>
                <p className="text-gray-500 dark:text-gray-500 text-xs mt-0.5">
                  📞 {SCHOOL_INFO.phone} | ✉️ {SCHOOL_INFO.email}
                </p>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center gap-2 print:hidden">
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2 border-red-600 text-red-600 hover:bg-red-50">
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Link to="/date-sheet">
                <Button variant="outline" size="sm" className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Calendar className="w-4 h-4" />
                  UT-4 Sheet
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 border-green-600 text-green-600 hover:bg-green-50">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 border-purple-600 text-purple-600 hover:bg-purple-50">
                <Download className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Title Card */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4 gap-2">
              <Badge className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-lg px-6 py-2 font-semibold">
                📝 Final Year Examination
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-red-600" />
              Final Examination Date Sheet
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base">
              Academic Session 2025-26
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/30 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Exam Time: 09:00 AM - 12:00 PM
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Classes: Pre Nursery to Class V
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-full">
                <Trophy className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Result: 31st March 2026
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalExamDays}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Exam Days</p>
              </div>
              <div className="text-center bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">1</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Day Gap</p>
              </div>
              <div className="text-center bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">31st</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Result Day</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notices */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-l-4 border-l-amber-500">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">Important Instructions:</p>
                <ul className="list-disc list-inside space-y-1 text-xs md:text-sm">
                  <li>Exams start from <strong>9th March 2026 (Monday)</strong></li>
                  <li>There is a <strong>preparation/break day</strong> between every exam</li>
                  <li><strong>Sundays are holidays</strong> — no exams</li>
                  <li>Final Year results will be declared on <strong>31st March 2026 (Tuesday)</strong></li>
                  <li>Students must bring their own stationery and admit card</li>
                  <li>Pre Nursery, Nursery & KG students: 6 exams | Class I: 7 exams | Class II-V: 9 exams</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 print:mb-4">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-white dark:bg-gray-800 border border-gray-300"></span>
            <span className="text-gray-600 dark:text-gray-400">Exam Day</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-blue-100 dark:bg-blue-900/50 border border-blue-300"></span>
            <span className="text-gray-600 dark:text-gray-400">Preparation Day</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-red-100 dark:bg-red-900/50 border border-red-300"></span>
            <span className="text-gray-600 dark:text-gray-400">Sunday Holiday</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-green-100 dark:bg-green-900/50 border border-green-300"></span>
            <span className="text-gray-600 dark:text-gray-400">Result Day</span>
          </div>
        </div>

        {/* Date Sheet Table */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="relative">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-600 hover:to-rose-600">
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4 sticky left-0 z-20 bg-red-600 min-w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4 sticky left-[100px] z-20 bg-rose-600 min-w-[90px]">
                      Day
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4 whitespace-nowrap">
                      Pre Nursery
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      Nursery
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      KG
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      Class I
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      Class II
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      Class III
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-red-500/30 py-4">
                      Class IV
                    </TableHead>
                    <TableHead className="text-white font-bold text-center py-4">
                      Class V
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSchedule.map((row, index) => {
                    const isBreak = row.type === 'break';
                    const isHoliday = row.type === 'holiday';
                    const isResult = row.type === 'result';
                    const isSpecial = isBreak || isHoliday || isResult;

                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          'transition-colors',
                          isHoliday && 'bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100/80 dark:hover:bg-red-900/30',
                          isBreak && 'bg-blue-50/60 dark:bg-blue-900/15 hover:bg-blue-100/60 dark:hover:bg-blue-900/25',
                          isResult && 'bg-green-50/80 dark:bg-green-900/20 hover:bg-green-100/80 dark:hover:bg-green-900/30',
                          !isSpecial && index % 2 === 0 && 'bg-gray-50/50 dark:bg-gray-700/30 hover:bg-gray-100/50 dark:hover:bg-gray-700/50',
                          !isSpecial && index % 2 !== 0 && 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                        )}
                      >
                        <TableCell className={cn(
                          "font-semibold text-center border-r border-gray-200 dark:border-gray-700 py-3 sticky left-0 z-10 min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                          isHoliday && 'bg-red-50 dark:bg-red-900/30',
                          isBreak && 'bg-blue-50 dark:bg-blue-900/20',
                          isResult && 'bg-green-50 dark:bg-green-900/30',
                          !isSpecial && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-700',
                          !isSpecial && index % 2 !== 0 && 'bg-white dark:bg-gray-800'
                        )}>
                          <span className={cn(
                            'px-2 py-1 rounded text-sm',
                            isHoliday && 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
                            isBreak && 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
                            isResult && 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
                            !isSpecial && 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                          )}>
                            {row.date}
                          </span>
                        </TableCell>
                        <TableCell className={cn(
                          "text-center border-r border-gray-200 dark:border-gray-700 py-3 font-medium sticky left-[100px] z-10 min-w-[90px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                          isHoliday && 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
                          isBreak && 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                          isResult && 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                          !isSpecial && 'text-gray-700 dark:text-gray-300',
                          !isSpecial && index % 2 === 0 && 'bg-gray-50 dark:bg-gray-700',
                          !isSpecial && index % 2 !== 0 && 'bg-white dark:bg-gray-800'
                        )}>
                          {row.day}
                          {row.note && (
                            <span className={cn(
                              'block text-[10px] mt-0.5 font-normal',
                              isHoliday && 'text-red-500',
                              isBreak && 'text-blue-500',
                              isResult && 'text-green-500'
                            )}>
                              {row.note}
                            </span>
                          )}
                        </TableCell>

                        {/* Subject cells — show note across full row for special days */}
                        {isSpecial ? (
                          <TableCell colSpan={8} className="text-center py-3">
                            <span className={cn(
                              'text-sm font-semibold italic',
                              isHoliday && 'text-red-500 dark:text-red-400',
                              isBreak && 'text-blue-500 dark:text-blue-400',
                              isResult && 'text-green-600 dark:text-green-400 text-base'
                            )}>
                              {isHoliday && '🔴 Sunday Holiday — No Exam'}
                              {isBreak && '📖 Preparation / Break Day'}
                              {isResult && '🎉🏆 Final Year Result Day! 🎓✨'}
                            </span>
                          </TableCell>
                        ) : (
                          <>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.preNursery} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.nursery} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.kg} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.classI} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.classII} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.classIII} />
                            </TableCell>
                            <TableCell className="text-center border-r border-gray-200 dark:border-gray-700 py-3">
                              <SubjectBadge subject={row.classIV} />
                            </TableCell>
                            <TableCell className="text-center py-3">
                              <SubjectBadge subject={row.classV} />
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Syllabus Note */}
        <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-center gap-3">
              <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              <p className="text-lg font-semibold text-green-800 dark:text-green-300">
                📚 Complete syllabus (full year) will be covered in the Final Examination
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Parent Note */}
        <Card className="mt-6 border-0 shadow-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <p className="text-base font-semibold text-violet-800 dark:text-violet-300">
                📢 Dear Parents
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
                Please ensure your child revises all subjects thoroughly. The final exam covers the <strong>complete syllabus</strong> of the academic year 2025-26.
                Preparation days have been provided between exams — kindly ensure students utilize them well.
                Results will be declared on <strong>31st March 2026</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mt-6 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                For any queries, contact us via:
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`https://wa.me/919717267473?text=Hello! I have a query regarding Final Year Exam Date Sheet 2026.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
              <a
                href={`mailto:${SCHOOL_INFO.email}?subject=Query regarding Final Year Exam Date Sheet 2026`}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
              <a
                href={`tel:${SCHOOL_INFO.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <p className="flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                {SCHOOL_INFO.phone}
              </p>
              <p className="flex items-center justify-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {SCHOOL_INFO.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 print:mt-4">
          <p>&copy; {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.</p>
          <p className="mt-1">Wishing all students the very best for their Final Examinations! 🎓🏆</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

// Subject Badge Component
const SubjectBadge: React.FC<{ subject: string }> = ({ subject }) => {
  if (subject === '-') {
    return <span className="text-gray-400 dark:text-gray-500">—</span>;
  }

  const getSubjectColor = (subj: string) => {
    const subjectLower = subj.toLowerCase();
    if (subjectLower.includes('result')) return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 font-bold';
    if (subjectLower.includes('eng')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300';
    if (subjectLower.includes('math') || subjectLower.includes('mental')) return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300';
    if (subjectLower.includes('hindi')) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300';
    if (subjectLower.includes('evs')) return 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300';
    if (subjectLower.includes('science')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300';
    if (subjectLower.includes('computer')) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
    if (subjectLower.includes('sanskrit')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
    if (subjectLower.includes('drawing') || subjectLower.includes('gk')) return 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300';
    if (subjectLower.includes('yoga') || subjectLower.includes('vocational')) return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  return (
    <span className={cn(
      'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
      getSubjectColor(subject)
    )}>
      {subject}
    </span>
  );
};

export default FinalDateSheet;
