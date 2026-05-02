import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, School, BookOpen, Download, Share2, Home, MessageCircle, Mail, Phone, Wifi, Filter, Volume2, VolumeX } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SCHOOL_INFO } from '@/constants/schoolInfo';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

type ClassKey =
  | 'preNursery'
  | 'nursery'
  | 'kg'
  | 'classI'
  | 'classII'
  | 'classIII'
  | 'classIV'
  | 'classV';

const CLASS_OPTIONS: { value: ClassKey; label: string }[] = [
  { value: 'preNursery', label: 'Pre Nursery' },
  { value: 'nursery', label: 'Nursery' },
  { value: 'kg', label: 'KG' },
  { value: 'classI', label: 'Class I' },
  { value: 'classII', label: 'Class II' },
  { value: 'classIII', label: 'Class III' },
  { value: 'classIV', label: 'Class IV' },
  { value: 'classV', label: 'Class V' },
];

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
    date: '05/05/2026',
    day: 'Tuesday',
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
    date: '06/05/2026',
    day: 'Wednesday',
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
    date: '07/05/2026',
    day: 'Thursday',
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
    date: '08/05/2026',
    day: 'Friday',
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
    date: '09/05/2026',
    day: 'Saturday',
    preNursery: 'Computer',
    nursery: 'Computer',
    kg: 'Computer',
    classI: 'Computer',
    classII: 'Computer',
    classIII: 'Computer',
    classIV: 'Computer',
    classV: 'Computer',
  },
  {
    date: '11/05/2026',
    day: 'Monday',
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
    date: '12/05/2026',
    day: 'Tuesday',
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
    date: '13/05/2026',
    day: 'Wednesday',
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


type Lang = 'en' | 'hi';

const getTimeBucket = (d = new Date()): 'morning' | 'afternoon' | 'evening' => {
  const h = d.getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
};

const buildGreeting = (lang: Lang, bucket: 'morning' | 'afternoon' | 'evening'): string => {
  if (lang === 'hi') {
    const hello =
      bucket === 'morning' ? 'सुप्रभात' :
      bucket === 'afternoon' ? 'नमस्कार' :
      'शुभ संध्या';
    return (
      `${hello}, अभिभावकों और प्यारे बच्चों! ` +
      `आपके बच्चों के यूनिट टेस्ट एक के एग्ज़ाम अब शुरू होने वाले हैं। ` +
      `परीक्षा 5 मई से 13 मई तक होगी, सुबह 9 बजे से 11 बजे तक। ` +
      `यह ऑनलाइन और ऑफ़लाइन दोनों मोड में होगी। ` +
      `कॉपी और स्टेशनरी स्कूल देगा, घर से भेजने की ज़रूरत नहीं है। ` +
      `कृपया अपना दिन उसी अनुसार प्लान करें। सभी बच्चों को हार्दिक शुभकामनाएँ!`
    );
  }
  const hello =
    bucket === 'morning' ? 'Good morning' :
    bucket === 'afternoon' ? 'Good afternoon' :
    'Good evening';
  return (
    `${hello}, dear parents and students! ` +
    `Your child’s Unit Test 1 examinations are about to begin. ` +
    `The exams will be held from 5th May to 13th May, between 9 AM and 11 AM. ` +
    `They will be conducted in both online and offline modes. ` +
    `Answer copies and stationery will be provided by the school, so children do not need to bring them from home. ` +
    `Kindly plan the day accordingly. We wish all our students the very best!`
  );
};

const T: Record<Lang, {
  badge: string;
  title: string;
  session: string;
  dateRange: React.ReactNode;
  examTime: string;
  classesRange: string;
  mode: string;
  noteHeader: string;
  notes: React.ReactNode[];
  filterByClass: string;
  selectClass: string;
  allClasses: string;
  playGreeting: string;
  stopGreeting: string;
  classLabels: Record<ClassKey, string>;
  contactTitle: string;
  whatsapp: string;
  email: string;
  call: string;
  footerWish: string;
}> = {
  en: {
    badge: 'Unit Test - 1',
    title: 'Examination Date Sheet',
    session: 'Academic Session 2026-27',
    dateRange: <>From 05<sup>th</sup> May 2026 to 13<sup>th</sup> May 2026</>,
    examTime: 'Exam Time: 09:00 AM - 11:00 AM',
    classesRange: 'Classes: Pre Nursery to Class V',
    mode: 'Mode: Online & Offline Examination',
    noteHeader: 'Important Notes',
    notes: [
      <>Unit Test - 1 papers will be conducted in <strong>both online and offline modes</strong>. Students attending school will appear offline; those unable to come may attend online — the joining link / instructions will be shared by the class teacher before each paper.</>,
      <><strong>Oral &amp; Written</strong> examinations of each subject will be conducted on the <strong>same day</strong>.</>,
      <>The school will provide the <strong>UT answer copy and required stationery items</strong> — students need <strong>not</strong> bring them from home.</>,
      <>If a student is <strong>unable to appear</strong> for any paper, kindly <strong>submit a leave application</strong> in advance.</>,
      <>Parents are requested to <strong>plan the day accordingly</strong> so that students reach school on time and well-prepared.</>,
      <>Sunday 10<sup>th</sup> May 2026 is a holiday — no exam on that day.</>,
    ],
    filterByClass: 'Filter by Class:',
    selectClass: 'Select a class',
    allClasses: 'All Classes',
    playGreeting: 'Play Greeting',
    stopGreeting: 'Stop Greeting',
    classLabels: {
      preNursery: 'Pre Nursery',
      nursery: 'Nursery',
      kg: 'KG',
      classI: 'Class I',
      classII: 'Class II',
      classIII: 'Class III',
      classIV: 'Class IV',
      classV: 'Class V',
    },
    contactTitle: 'For any queries, contact us via:',
    whatsapp: 'WhatsApp Us',
    email: 'Email Us',
    call: 'Call Us',
    footerWish: 'Wishing all students the very best for their examinations! 🎓',
  },
  hi: {
    badge: 'यूनिट टेस्ट - 1',
    title: 'परीक्षा डेटशीट',
    session: 'शैक्षणिक सत्र 2026-27',
    dateRange: <>05 मई 2026 से 13 मई 2026 तक</>,
    examTime: 'परीक्षा का समय: प्रातः 09:00 बजे से 11:00 बजे तक',
    classesRange: 'कक्षाएँ: प्री-नर्सरी से कक्षा 5 तक',
    mode: 'माध्यम: ऑनलाइन एवं ऑफ़लाइन परीक्षा',
    noteHeader: 'महत्वपूर्ण सूचनाएँ',
    notes: [
      <>यूनिट टेस्ट - 1 की परीक्षाएँ <strong>ऑनलाइन एवं ऑफ़लाइन दोनों माध्यमों</strong> से आयोजित की जाएंगी। विद्यालय आने वाले छात्र ऑफ़लाइन परीक्षा देंगे, और जो नहीं आ पाएंगे वे ऑनलाइन जुड़ सकते हैं — जोड़ने की लिंक व निर्देश कक्षा शिक्षिका द्वारा प्रत्येक परीक्षा से पहले साझा किए जाएंगे।</>,
      <>प्रत्येक विषय की <strong>मौखिक एवं लिखित</strong> परीक्षा <strong>एक ही दिन</strong> आयोजित की जाएगी।</>,
      <>विद्यालय द्वारा <strong>यूनिट टेस्ट कॉपी एवं आवश्यक स्टेशनरी सामग्री</strong> प्रदान की जाएगी — छात्रों को घर से <strong>नहीं</strong> लानी है।</>,
      <>यदि कोई छात्र किसी परीक्षा में <strong>उपस्थित नहीं हो पाता</strong> है, तो कृपया पहले से <strong>अवकाश प्रार्थना पत्र</strong> जमा करवाएं।</>,
      <>अभिभावकों से अनुरोध है कि वे <strong>अपना दिन उसी अनुसार योजनाबद्ध</strong> करें ताकि छात्र समय पर विद्यालय पहुँचें और परीक्षा के लिए पूर्ण रूप से तैयार हों।</>,
      <>रविवार 10 मई 2026 को अवकाश है — उस दिन कोई परीक्षा नहीं होगी।</>,
    ],
    filterByClass: 'कक्षा चुनें:',
    selectClass: 'कक्षा चुनें',
    allClasses: 'सभी कक्षाएँ',
    playGreeting: 'अभिवादन सुनें',
    stopGreeting: 'अभिवादन रोकें',
    classLabels: {
      preNursery: 'प्री-नर्सरी',
      nursery: 'नर्सरी',
      kg: 'के.जी.',
      classI: 'कक्षा 1',
      classII: 'कक्षा 2',
      classIII: 'कक्षा 3',
      classIV: 'कक्षा 4',
      classV: 'कक्षा 5',
    },
    contactTitle: 'किसी भी जानकारी के लिए हमसे संपर्क करें:',
    whatsapp: 'व्हाट्सएप',
    email: 'ईमेल',
    call: 'कॉल करें',
    footerWish: 'सभी छात्रों को परीक्षा के लिए हार्दिक शुभकामनाएँ! 🎓',
  },
};

const DateSheet: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<ClassKey | 'all'>('all');
  const [lang, setLang] = useState<Lang>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [greetingText, setGreetingText] = useState<string>('');
  const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
  const greetedRef = useRef<Lang | null>(null);
  const t = T[lang];

  const speak = (text: string, langCode: 'en-US' | 'hi-IN') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.rate = 0.95;
      utter.pitch = 1;
      utter.onstart = () => setIsSpeaking(true);
      utter.onboundary = (e: SpeechSynthesisEvent) => {
        if (e.name === 'word' || e.name === undefined) {
          setHighlightIndex(e.charIndex);
        }
      };
      utter.onend = () => {
        setIsSpeaking(false);
        setHighlightIndex(null);
      };
      utter.onerror = () => {
        setIsSpeaking(false);
        setHighlightIndex(null);
      };
      setGreetingText(text);
      setHighlightIndex(0);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    } catch {
      setIsSpeaking(false);
      setHighlightIndex(null);
    }
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setHighlightIndex(null);
  };

  const playGreeting = () => {
    const text = buildGreeting(lang, getTimeBucket());
    speak(text, lang === 'hi' ? 'hi-IN' : 'en-US');
  };

  // Update displayed greeting whenever language changes (so the panel preview matches).
  useEffect(() => {
    setGreetingText(buildGreeting(lang, getTimeBucket()));
  }, [lang]);

  // Auto-greet once per language switch (after a small delay so browser allows it).
  useEffect(() => {
    if (greetedRef.current === lang) return;
    greetedRef.current = lang;
    const timer = setTimeout(() => {
      try {
        const text = buildGreeting(lang, getTimeBucket());
        speak(text, lang === 'hi' ? 'hi-IN' : 'en-US');
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const visibleClasses =
    selectedClass === 'all'
      ? CLASS_OPTIONS
      : CLASS_OPTIONS.filter((c) => c.value === selectedClass);

  const handleShare = async () => {
    const shareData = {
      title: `${SCHOOL_INFO.name} - Unit Test 1 Date Sheet`,
      text: `Check out the Unit Test 1 examination schedule for ${SCHOOL_INFO.name}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header Section */}
      <div className="bg-white border-b-4 border-blue-600 shadow-lg print:shadow-none">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* School Branding */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-xl print:border-2 print:border-blue-600">
                <School className="w-12 h-12 md:w-14 md:h-14 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight uppercase">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-blue-600 font-medium text-sm md:text-base italic">
                  {SCHOOL_INFO.tagline}
                </p>
                <p className="text-gray-600 text-xs md:text-sm mt-1 flex items-center gap-1">
                  <span className="inline-block w-4 h-4">📍</span>
                  Saurabh Vihar, Jaitpur, Badarpur, New Delhi - 110044
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
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
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            {/* Language Tabs + Voice greeting */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4 print:hidden">
              <Tabs value={lang} onValueChange={(v) => setLang(v as Lang)}>
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="hi">हिन्दी</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : playGreeting}
                className={cn(
                  'gap-2',
                  isSpeaking
                    ? 'border-red-500 text-red-600 hover:bg-red-50'
                    : 'border-emerald-600 text-emerald-700 hover:bg-emerald-50'
                )}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? t.stopGreeting : t.playGreeting}
              </Button>
            </div>

            {/* Greeting reading panel with live word highlight */}
            {greetingText && (
              <div className="mb-5 print:hidden mx-auto max-w-3xl">
                <div
                  className={cn(
                    'rounded-xl border p-4 text-left text-[15px] leading-relaxed transition-all',
                    isSpeaking
                      ? 'bg-emerald-50 border-emerald-300 shadow-md'
                      : 'bg-gray-50 border-gray-200'
                  )}
                  lang={lang === 'hi' ? 'hi' : 'en'}
                >
                  <HighlightedText
                    text={greetingText}
                    activeIndex={isSpeaking ? highlightIndex : null}
                  />
                </div>
              </div>
            )}
            <div className="flex justify-center mb-4">
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-6 py-2 font-semibold">
                {t.badge}
              </Badge>
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              {t.title}
            </CardTitle>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              {t.session}
            </p>
            <p className="text-gray-600 mt-1 text-sm md:text-base font-medium">
              {t.dateRange}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">
                  {t.examTime}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <BookOpen className="w-4 h-4 text-green-600" />
                <span className="text-gray-700">
                  {t.classesRange}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 px-4 py-2 rounded-full">
                <Wifi className="w-4 h-4 text-purple-600" />
                <span className="text-gray-700 font-medium">
                  {t.mode}
                </span>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md text-sm text-amber-900">
              <p className="font-semibold mb-2">{t.noteHeader}:</p>
              <ul className="list-disc pl-5 space-y-1.5 marker:text-amber-600">
                {t.notes.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Date Sheet Table */}
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden">
          {/* Class Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
            <div className="flex items-center gap-2 text-gray-700">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">{t.filterByClass}</span>
            </div>
            <div className="w-full sm:w-64">
              <Select
                value={selectedClass}
                onValueChange={(v) => setSelectedClass(v as ClassKey | 'all')}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder={t.selectClass} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.allClasses}</SelectItem>
                  {CLASS_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {t.classLabels[c.value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    {visibleClasses.map((c, idx) => (
                      <TableHead
                        key={c.value}
                        className={cn(
                          'text-white font-bold text-center py-4 whitespace-nowrap',
                          idx < visibleClasses.length - 1 && 'border-r border-blue-500/30'
                        )}
                      >
                        {t.classLabels[c.value]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examSchedule.map((row, index) => (
                    <TableRow
                      key={index}
                      className={cn(
                        'hover:bg-blue-50/50 transition-colors',
                        index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'
                      )}
                    >
                      <TableCell className={cn(
                        "font-semibold text-center border-r border-gray-200 py-3 sticky left-0 z-10 min-w-[100px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      )}>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                          {row.date}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        "text-center border-r border-gray-200 py-3 font-medium text-gray-700 sticky left-[100px] z-10 min-w-[90px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      )}>
                        {row.day}
                      </TableCell>
                      {visibleClasses.map((c, idx) => (
                        <TableCell
                          key={c.value}
                          className={cn(
                            'text-center py-3',
                            idx < visibleClasses.length - 1 && 'border-r border-gray-200'
                          )}
                        >
                          <SubjectBadge subject={row[c.value]} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section with WhatsApp */}
        <Card className="mt-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="py-6">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold text-gray-800 mb-2">
                For any queries, contact us via:
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {/* WhatsApp Button */}
              <a
                href={`https://wa.me/919717267473?text=Hello! I have a query regarding Unit Test 1 Date Sheet.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp Us
              </a>
              
              {/* Email Button */}
              <a
                href={`mailto:${SCHOOL_INFO.email}?subject=Query regarding Unit Test 1 Date Sheet`}
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
            
            <div className="mt-6 text-center text-sm text-gray-500">
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
        <div className="mt-8 text-center text-sm text-gray-500 print:mt-4">
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
    return <span className="text-gray-400">—</span>;
  }

  const getSubjectColor = (subj: string) => {
    const subjectLower = subj.toLowerCase();
    if (subjectLower.includes('eng')) return 'bg-blue-100 text-blue-700';
    if (subjectLower.includes('math') || subjectLower.includes('mental')) return 'bg-green-100 text-green-700';
    if (subjectLower.includes('hindi')) return 'bg-orange-100 text-orange-700';
    if (subjectLower.includes('evs')) return 'bg-teal-100 text-teal-700';
    if (subjectLower.includes('science')) return 'bg-purple-100 text-purple-700';
    if (subjectLower.includes('computer')) return 'bg-indigo-100 text-indigo-700';
    if (subjectLower.includes('sanskrit')) return 'bg-amber-100 text-amber-700';
    if (subjectLower.includes('drawing') || subjectLower.includes('gk')) return 'bg-pink-100 text-pink-700';
    if (subjectLower.includes('yoga') || subjectLower.includes('vocational')) return 'bg-cyan-100 text-cyan-700';
    return 'bg-gray-100 text-gray-700';
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

// Highlighted reading text — splits text into word tokens and highlights the
// word currently being spoken (based on SpeechSynthesis boundary `charIndex`).
const HighlightedText: React.FC<{ text: string; activeIndex: number | null }> = ({ text, activeIndex }) => {
  // Split into [word, gap, word, gap, ...] preserving whitespace + punctuation.
  const tokens: { value: string; start: number; isWord: boolean }[] = [];
  const regex = /\S+|\s+/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    tokens.push({
      value: m[0],
      start: m.index,
      isWord: /\S/.test(m[0]),
    });
  }

  // Find the active word: the last word token whose start <= activeIndex.
  let activeWordIdx = -1;
  if (activeIndex !== null) {
    for (let i = 0; i < tokens.length; i++) {
      const tk = tokens[i];
      if (tk.isWord && tk.start <= activeIndex) activeWordIdx = i;
      if (tk.start > activeIndex) break;
    }
  }

  return (
    <p className="text-gray-800">
      {tokens.map((tk, i) =>
        tk.isWord ? (
          <span
            key={i}
            className={cn(
              'transition-colors duration-150 rounded px-0.5',
              i === activeWordIdx
                ? 'bg-yellow-300 text-gray-900 font-semibold'
                : i < activeWordIdx
                ? 'text-gray-500'
                : 'text-gray-800'
            )}
          >
            {tk.value}
          </span>
        ) : (
          <span key={i}>{tk.value}</span>
        )
      )}
    </p>
  );
};

export default DateSheet;
