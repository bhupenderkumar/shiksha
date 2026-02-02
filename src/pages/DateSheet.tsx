import React from 'react';
import { Calendar, Clock, School, BookOpen, Download, Share2, Home, MessageCircle, Mail, Phone } from 'lucide-react';
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

interface ExamSchedule {
  date: string;
  day: string;
  preNursery: string;
  nursery: string;
  kg: string;
  classI: string;
  classII: string;
  classIII: string;
  classIV: string;
  classV: string;
}

const examSchedule: ExamSchedule[] = [
  {
    date: '04/02/2026',
    day: 'Wednesday',
    preNursery: 'Eng',
    nursery: 'Eng',
    kg: 'Eng',
    classI: 'Eng',
    classII: 'Eng',
    classIII: 'Eng',
    classIV: 'Eng',
    classV: 'Eng',
  },
  {
    date: '05/02/2026',
    day: 'Thursday',
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
    date: '06/02/2026',
    day: 'Friday',
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
    date: '07/02/2026',
    day: 'Saturday',
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
    date: '09/02/2026',
    day: 'Monday',
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
    date: '10/02/2026',
    day: 'Tuesday',
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
    date: '11/02/2026',
    day: 'Wednesday',
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
    date: '12/02/2026',
    day: 'Thursday',
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
    date: '13/02/2026',
    day: 'Friday',
    preNursery: '-',
    nursery: '-',
    kg: '-',
    classI: '-',
    classII: 'Yoga / Vocational / Devotional',
    classIII: 'Yoga / Vocational / Devotional',
    classIV: 'Yoga / Vocational / Devotional',
    classV: 'Yoga / Vocational / Devotional',
  },
];

const DateSheet: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: `${SCHOOL_INFO.name} - Unit Test 4 Date Sheet`,
      text: `Check out the Unit Test 4 examination schedule for ${SCHOOL_INFO.name}`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Professional Header Section */}
      <div className="bg-white dark:bg-gray-900 border-b-4 border-blue-600 shadow-lg print:shadow-none">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* School Branding */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-xl print:border-2 print:border-blue-600">
                <School className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight uppercase">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-blue-600 dark:text-blue-400 font-medium text-sm md:text-base italic">
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
                <Button variant="outline" size="sm" className="gap-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Home className="w-4 h-4" />
                  Home
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
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-6 py-2 font-semibold">
                Unit Test - 4
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Examination Date Sheet
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm md:text-base">
              Academic Session 2025-26
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Exam Time: 09:00 AM - 11:00 AM
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  Classes: Pre Nursery to Class V
                </span>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/30 px-4 py-2 rounded-full">
                <School className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  School Dispersal: As Usual
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Sheet Table */}
        <Card className="border-0 shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="relative">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-600">
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4 sticky left-0 z-20 bg-blue-600 min-w-[100px]">
                      Date
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4 sticky left-[100px] z-20 bg-indigo-600 min-w-[90px]">
                      Day
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4 whitespace-nowrap">
                      Pre Nursery
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      Nursery
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      KG
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      Class I
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      Class II
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      Class III
                    </TableHead>
                    <TableHead className="text-white font-bold text-center border-r border-blue-500/30 py-4">
                      Class IV
                    </TableHead>
                    <TableHead className="text-white font-bold text-center py-4">
                      Class V
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSchedule.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        'hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors',
                        index % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-700/30' : 'bg-white dark:bg-gray-800'
                      )}
                    >
                      <TableCell className={cn(
                        "font-semibold text-center border-r border-gray-200 dark:border-gray-700 py-3 sticky left-0 z-10 min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                      )}>
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-sm">
                          {row.date}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-center border-r border-gray-200 dark:border-gray-700 py-3 font-medium text-gray-700 dark:text-gray-300 sticky left-[100px] z-10 min-w-[90px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                      )}>
                        {row.day}
                      </TableCell>
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
                    </TableRow>
                  ))}
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
                📚 Syllabus has already been shared with students
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section with WhatsApp */}
        <Card className="mt-6 border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                For any queries, contact us via:
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/919717267473?text=Hello! I have a query regarding Unit Test 4 Date Sheet.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
              
              {/* Email Button */}
              <a
                href={`mailto:${SCHOOL_INFO.email}?subject=Query regarding Unit Test 4 Date Sheet`}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Us
              </a>
              
              {/* Call Button */}
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
          <p>© {new Date().getFullYear()} {SCHOOL_INFO.name}. All rights reserved.</p>
          <p className="mt-1">Wishing all students the very best for their examinations! 🎓</p>
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
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:text-black {
            color: black !important;
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

export default DateSheet;
