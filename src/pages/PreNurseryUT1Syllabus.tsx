import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Download,
  Share2,
  Home,
  FileText,
  Calculator,
  Sprout,
  Languages,
  GraduationCap,
  Monitor,
  Palette,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import toast from 'react-hot-toast';

const PDF_URL = '/syllabus/pre-nursery-ut1-syllabus-2026-27.pdf';
const PAGE_IMAGES = [1, 2, 3, 4, 5, 6, 7, 8].map(
  (n) => `/syllabus/pre-nursery-ut1-page-${n}.png`
);

interface SubjectSection {
  key: string;
  title: string;
  scope: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  ring: string;
  items: string[];
}

const SECTIONS: SubjectSection[] = [
  {
    key: 'english',
    title: 'English',
    scope: 'Sleeping & Standing line · L T I',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'border-blue-200',
    items: [
      'Trace the lines',
      'Colour the pictures',
      'Trace the letters — L, T, I',
      'Match the same letters',
      'Match the same pictures and colour it',
    ],
  },
  {
    key: 'evs',
    title: 'E.V.S.',
    scope: 'Colour the fruits',
    icon: Sprout,
    gradient: 'from-lime-500 to-green-600',
    ring: 'border-green-200',
    items: [
      'Cherry — Red colour',
      'Banana — Yellow colour',
      'Strawberry — Red colour',
      'Orange — Orange colour',
    ],
  },
  {
    key: 'maths',
    title: 'Maths',
    scope: 'Shapes & Numbers',
    icon: Calculator,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'border-emerald-200',
    items: [
      'Join the dots and draw a shape',
      'Colour the shapes',
      'Match the same numbers',
      'Match the same shapes and colour it',
    ],
  },
  {
    key: 'computer',
    title: 'Computer',
    scope: 'Parts of Computer',
    icon: Monitor,
    gradient: 'from-sky-500 to-cyan-600',
    ring: 'border-sky-200',
    items: [
      'Colour the parts of computer',
      'Monitor',
      'C.P.U.',
      'Keyboard',
      'Mouse',
    ],
  },
  {
    key: 'hindi',
    title: 'Hindi',
    scope: 'रेखा · रंग · मिलान',
    icon: Languages,
    gradient: 'from-orange-500 to-rose-600',
    ring: 'border-orange-200',
    items: [
      'कर्व रेखा ट्रेस करो',
      'रंग भरो',
      'मिलान करो',
    ],
  },
  {
    key: 'drawing',
    title: 'Drawing',
    scope: 'Colour the pictures',
    icon: Palette,
    gradient: 'from-pink-500 to-fuchsia-600',
    ring: 'border-pink-200',
    items: [
      'Ice Cream',
      'Cup',
    ],
  },
];

const PreNurseryUT1Syllabus: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: 'Pre Nursery — F.A.-1 Syllabus (2026-27)',
      text: 'Pre Nursery Formative Assessment - 1 Syllabus for Session 2026-27 — First Step Public School',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-3 rounded-2xl backdrop-blur">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-white/85 font-semibold">
                  {SCHOOL_INFO?.name || 'First Step Public School'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Pre Nursery — F.A.-1 Syllabus
                </h1>
                <p className="text-white/90 text-sm sm:text-base mt-0.5">
                  Formative Assessment 1 · Academic Session 2026-27
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-rose-700 hover:bg-rose-50"
              >
                <a href={PDF_URL} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </Button>
              <Button
                variant="secondary"
                onClick={handleShare}
                className="bg-white/15 text-white hover:bg-white/25 border border-white/30"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                asChild
                variant="secondary"
                className="bg-white/15 text-white hover:bg-white/25 border border-white/30"
              >
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 sm:py-10 space-y-6">
        {/* Quick info */}
        <Card className="border-rose-100 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 text-rose-700 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-sm sm:text-base">
                <p className="font-semibold text-gray-900">
                  Subjects: English · E.V.S. · Maths · Computer · Hindi · Drawing
                </p>
                <p className="text-gray-600">
                  English paper carries{' '}
                  <span className="font-semibold">15 marks</span>. Refer to the date
                  sheet for exam dates.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                to="/date-sheet"
                className="text-rose-700 hover:text-rose-900 font-semibold whitespace-nowrap"
              >
                Date Sheet →
              </Link>
              <Link
                to="/syllabus/nursery-ut1"
                className="text-indigo-700 hover:text-indigo-900 font-semibold whitespace-nowrap"
              >
                Nursery Syllabus →
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Subject cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <Card
                key={section.key}
                className={`overflow-hidden border-2 ${section.ring} shadow-md hover:shadow-lg transition-shadow`}
              >
                <CardHeader
                  className={`bg-gradient-to-r ${section.gradient} text-white p-4`}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold">
                      <Icon className="h-5 w-5" />
                      {section.title}
                    </CardTitle>
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                      {section.scope}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-5 bg-white">
                  <ul className="space-y-1.5">
                    {section.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-800"
                      >
                        <span className="text-amber-500 mt-0.5">★</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Original PDF preview */}
        <Card className="border-rose-100 shadow-sm">
          <CardHeader className="p-4 sm:p-5 border-b bg-gradient-to-r from-rose-50 to-amber-50">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-rose-600" />
              Original Handwritten Syllabus & Sample Papers
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 bg-white">
            <p className="text-sm text-gray-600">
              Below is the scanned copy as shared by the class teacher, including
              sample question papers. You can also{' '}
              <a
                href={PDF_URL}
                download
                className="text-rose-700 font-semibold hover:underline"
              >
                download the full PDF
              </a>
              .
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PAGE_IMAGES.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`Pre Nursery syllabus — Page ${idx + 1}`}
                  className="w-full rounded-lg border border-gray-200 shadow-sm"
                  loading="lazy"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-xs sm:text-sm text-gray-500 py-6">
          For any clarifications, please contact the class teacher or the school office.
        </div>
      </main>
    </div>
  );
};

export default PreNurseryUT1Syllabus;
