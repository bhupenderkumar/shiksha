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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import toast from 'react-hot-toast';

const PDF_URL = '/syllabus/nursery-ut1-syllabus-2026-27.pdf';

interface SubjectSection {
  key: string;
  title: string;
  scope: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string; // header gradient
  ring: string; // ring/border colour
  written: string[];
  oral: string[];
}

const SECTIONS: SubjectSection[] = [
  {
    key: 'english',
    title: 'English',
    scope: 'A to E',
    icon: BookOpen,
    gradient: 'from-blue-500 to-indigo-600',
    ring: 'border-blue-200',
    written: [
      'Look and write (A to E)',
      'Look at the picture and circle the first letter',
      'Match the same letters',
      'Match the letter to the correct picture',
    ],
    oral: [
      'Recitation of (A to E)',
      'Recognition of letters (A to E)',
      'Speaking one word for each letter',
    ],
  },
  {
    key: 'hindi',
    title: 'Hindi',
    scope: 'अ से अः',
    icon: Languages,
    gradient: 'from-orange-500 to-rose-600',
    ring: 'border-orange-200',
    written: [
      'दिए गए चित्रों को देखकर सही अक्षर पर गोला लगाओ',
      'समान अक्षरों का मिलान करो',
      'अक्षरों को सही चित्र से मिलाओ',
    ],
    oral: [
      '(अ से अः) तक स्वर बोलो',
      'अक्षरों की पहचान करो',
    ],
  },
  {
    key: 'math',
    title: 'Math',
    scope: '1 to 5',
    icon: Calculator,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'border-emerald-200',
    written: [
      '(1 to 5) Look and write',
      'Match the shapes',
      'Odd one out',
      'Match the same digits',
    ],
    oral: [
      'Counting (1 to 5)',
      'Numbers recognition (1–5)',
      'Objects counting',
    ],
  },
  {
    key: 'evs',
    title: 'E.V.S.',
    scope: 'My Body & Surroundings',
    icon: Sprout,
    gradient: 'from-lime-500 to-green-600',
    ring: 'border-green-200',
    written: [
      'Match the parts of body',
      'Match the parts of plants',
      'Look at the picture and identify',
      'Circle the domestic animals',
    ],
    oral: [
      'Names of colours',
      'Names of fruits',
      'Names of animals',
      'Names of parts of body',
    ],
  },
];

const NurseryUT1Syllabus: React.FC = () => {
  const handleShare = async () => {
    const shareData = {
      title: 'Nursery — UT-1 Syllabus (2026-27)',
      text: 'Nursery Unit Test - 1 Syllabus for Session 2026-27 — First Step Public School',
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/15 p-3 rounded-2xl backdrop-blur">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs sm:text-sm uppercase tracking-widest text-white/80 font-semibold">
                  {SCHOOL_INFO?.name || 'First Step Public School'}
                </p>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                  Nursery — UT-1 Syllabus
                </h1>
                <p className="text-white/85 text-sm sm:text-base mt-0.5">
                  Unit Test - 1 · Academic Session 2026-27 · Total Marks: 20 per subject
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                asChild
                variant="secondary"
                className="bg-white text-indigo-700 hover:bg-indigo-50"
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
        <Card className="border-indigo-100 shadow-sm">
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-700 p-2 rounded-lg">
                <FileText className="h-5 w-5" />
              </div>
              <div className="text-sm sm:text-base">
                <p className="font-semibold text-gray-900">
                  Subjects: English · Hindi · Math · E.V.S.
                </p>
                <p className="text-gray-600">
                  Each paper carries <span className="font-semibold">20 marks</span>{' '}
                  (Written + Oral). Refer to the date sheet for exam dates.
                </p>
              </div>
            </div>
            <Link
              to="/date-sheet"
              className="text-indigo-700 hover:text-indigo-900 font-semibold text-sm whitespace-nowrap"
            >
              View Date Sheet →
            </Link>
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
                <CardContent className="p-4 sm:p-5 space-y-4 bg-white">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Written
                    </h3>
                    <ul className="space-y-1.5">
                      {section.written.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                          <span className="text-amber-500 mt-0.5">★</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="border-t border-dashed border-gray-200 pt-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                      Oral
                    </h3>
                    <ul className="space-y-1.5">
                      {section.oral.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                          <span className="text-pink-500 mt-0.5">★</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Original PDF preview */}
        <Card className="border-indigo-100 shadow-sm">
          <CardHeader className="p-4 sm:p-5 border-b bg-gradient-to-r from-indigo-50 to-pink-50">
            <CardTitle className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Original Handwritten Syllabus (PDF)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-5 space-y-4 bg-white">
            <p className="text-sm text-gray-600">
              Below is the scanned copy as shared by the class teacher. You can also{' '}
              <a
                href={PDF_URL}
                download
                className="text-indigo-700 font-semibold hover:underline"
              >
                download the PDF
              </a>
              .
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <img
                src="/syllabus/nursery-ut1-page-1.png"
                alt="Nursery UT-1 Syllabus — Page 1 (English, Hindi, Math)"
                className="w-full rounded-lg border border-gray-200 shadow-sm"
                loading="lazy"
              />
              <img
                src="/syllabus/nursery-ut1-page-2.png"
                alt="Nursery UT-1 Syllabus — Page 2 (E.V.S.)"
                className="w-full rounded-lg border border-gray-200 shadow-sm"
                loading="lazy"
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <div className="text-center text-xs sm:text-sm text-gray-500 py-6">
          For any clarifications, please contact the class teacher or the school office.
        </div>
      </main>
    </div>
  );
};

export default NurseryUT1Syllabus;
