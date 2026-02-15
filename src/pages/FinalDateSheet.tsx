import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Printer,
  GraduationCap,
  BookOpen,
  Trophy,
  Sun,
  Clock,
} from "lucide-react";
import { SCHOOL_INFO } from "@/constants/schoolInfo";

// ─── Types ────────────────────────────────────────────────
type ClassKey =
  | "preNursery"
  | "nursery"
  | "lkg"
  | "ukg"
  | "class1"
  | "class2"
  | "class3"
  | "class4"
  | "class5";

type FilterValue = "all" | ClassKey;

interface ExamRow {
  date: string;
  day: string;
  preNursery: string;
  nursery: string;
  lkg: string;
  ukg: string;
  class1: string;
  class2: string;
  class3: string;
  class4: string;
  class5: string;
  type: "exam" | "holiday" | "break" | "result" | "combined";
}

// ─── Constants ────────────────────────────────────────────
const CLASS_OPTIONS: { value: FilterValue; label: string; short: string }[] = [
  { value: "all", label: "All Classes", short: "All" },
  { value: "preNursery", label: "Pre Nursery", short: "Pre-N" },
  { value: "nursery", label: "Nursery", short: "Nur" },
  { value: "lkg", label: "LKG", short: "LKG" },
  { value: "ukg", label: "UKG", short: "UKG" },
  { value: "class1", label: "Class I", short: "I" },
  { value: "class2", label: "Class II", short: "II" },
  { value: "class3", label: "Class III", short: "III" },
  { value: "class4", label: "Class IV", short: "IV" },
  { value: "class5", label: "Class V", short: "V" },
];

const EXAM_SCHEDULE: ExamRow[] = [
  {
    date: "09 Mar",
    day: "Mon",
    preNursery: "English",
    nursery: "English",
    lkg: "English",
    ukg: "English",
    class1: "English",
    class2: "English",
    class3: "English",
    class4: "English",
    class5: "English",
    type: "exam",
  },
  {
    date: "10 Mar",
    day: "Tue",
    preNursery: "Break",
    nursery: "Break",
    lkg: "Break",
    ukg: "Break",
    class1: "Break",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "11 Mar",
    day: "Wed",
    preNursery: "Hindi",
    nursery: "Hindi",
    lkg: "Hindi",
    ukg: "Hindi",
    class1: "Hindi",
    class2: "Hindi",
    class3: "Hindi",
    class4: "Hindi",
    class5: "Hindi",
    type: "exam",
  },
  {
    date: "12 Mar",
    day: "Thu",
    preNursery: "Break",
    nursery: "Break",
    lkg: "Break",
    ukg: "Break",
    class1: "Break",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "13 Mar",
    day: "Fri",
    preNursery: "Maths",
    nursery: "Maths",
    lkg: "Maths",
    ukg: "Maths",
    class1: "Maths",
    class2: "Maths",
    class3: "Maths",
    class4: "Maths",
    class5: "Maths",
    type: "exam",
  },
  {
    date: "14 Mar",
    day: "Sat",
    preNursery: "Break",
    nursery: "Break",
    lkg: "Break",
    ukg: "Break",
    class1: "Break",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "15 Mar",
    day: "Sun",
    preNursery: "Holiday",
    nursery: "Holiday",
    lkg: "Holiday",
    ukg: "Holiday",
    class1: "Holiday",
    class2: "Holiday",
    class3: "Holiday",
    class4: "Holiday",
    class5: "Holiday",
    type: "holiday",
  },
  {
    date: "16 Mar",
    day: "Mon",
    preNursery: "EVS / Oral",
    nursery: "EVS / Oral",
    lkg: "EVS / Oral",
    ukg: "EVS / Oral",
    class1: "EVS / Oral",
    class2: "EVS",
    class3: "EVS",
    class4: "Science",
    class5: "Science",
    type: "exam",
  },
  {
    date: "17 Mar",
    day: "Tue",
    preNursery: "Break",
    nursery: "Break",
    lkg: "Break",
    ukg: "Break",
    class1: "Break",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "18 Mar",
    day: "Wed",
    preNursery: "Computer + Drawing",
    nursery: "Computer + Drawing",
    lkg: "Computer + Drawing",
    ukg: "Computer + Drawing",
    class1: "Computer + Drawing",
    class2: "SST",
    class3: "SST",
    class4: "SST",
    class5: "SST",
    type: "combined",
  },
  {
    date: "19 Mar",
    day: "Thu",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "Break",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "20 Mar",
    day: "Fri",
    preNursery: "GK",
    nursery: "GK",
    lkg: "GK",
    ukg: "GK",
    class1: "GK",
    class2: "Computer",
    class3: "Computer",
    class4: "Computer",
    class5: "Computer",
    type: "exam",
  },
  {
    date: "21 Mar",
    day: "Sat",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "22 Mar",
    day: "Sun",
    preNursery: "Holiday",
    nursery: "Holiday",
    lkg: "Holiday",
    ukg: "Holiday",
    class1: "Holiday",
    class2: "Holiday",
    class3: "Holiday",
    class4: "Holiday",
    class5: "Holiday",
    type: "holiday",
  },
  {
    date: "23 Mar",
    day: "Mon",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "Drawing",
    class3: "Drawing",
    class4: "Drawing",
    class5: "Drawing",
    type: "exam",
  },
  {
    date: "24 Mar",
    day: "Tue",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "25 Mar",
    day: "Wed",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "GK",
    class3: "GK",
    class4: "GK",
    class5: "GK",
    type: "exam",
  },
  {
    date: "26 Mar",
    day: "Thu",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "Break",
    class3: "Break",
    class4: "Break",
    class5: "Break",
    type: "break",
  },
  {
    date: "27 Mar",
    day: "Fri",
    preNursery: "—",
    nursery: "—",
    lkg: "—",
    ukg: "—",
    class1: "—",
    class2: "Oral",
    class3: "Oral",
    class4: "Oral",
    class5: "Oral",
    type: "exam",
  },
  {
    date: "31 Mar",
    day: "Tue",
    preNursery: "Result Day",
    nursery: "Result Day",
    lkg: "Result Day",
    ukg: "Result Day",
    class1: "Result Day",
    class2: "Result Day",
    class3: "Result Day",
    class4: "Result Day",
    class5: "Result Day",
    type: "result",
  },
];

// ─── Helper ───────────────────────────────────────────────
function getClassLabel(key: FilterValue): string {
  return CLASS_OPTIONS.find((c) => c.value === key)?.label ?? "";
}

function getFilteredSchedule(classKey: ClassKey) {
  return EXAM_SCHEDULE.filter((row) => {
    const val = row[classKey];
    return val !== "—";
  });
}

function getRowStyle(_type: ExamRow["type"], idx: number) {
  return idx % 2 === 0 ? "bg-white" : "bg-gray-50";
}

function SubjectBadge({ subject }: { subject: string }) {
  if (subject === "—") return <span className="text-gray-400">—</span>;
  if (subject === "Holiday")
    return (
      <span className="font-medium text-gray-700 inline-flex items-center gap-1">
        <Sun className="h-3 w-3" /> Holiday
      </span>
    );
  if (subject === "Break")
    return (
      <span className="text-gray-500 inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> Break
      </span>
    );
  if (subject === "Result Day")
    return (
      <span className="font-bold text-gray-900 inline-flex items-center gap-1">
        <Trophy className="h-3 w-3" /> Result Day
      </span>
    );
  return (
    <span className="font-medium text-gray-800 inline-flex items-center gap-1">
      <BookOpen className="h-3 w-3" /> {subject}
    </span>
  );
}

// ─── School Header Component ─────────────────────────────
function SchoolHeader() {
  return (
    <div className="flex flex-col items-center gap-2 border-b-2 border-gray-800 pb-4 mb-4">
      <div className="flex items-center gap-3 sm:gap-4">
        <img
          src={SCHOOL_INFO.logo}
          alt={SCHOOL_INFO.name}
          className="h-14 w-14 sm:h-16 sm:w-16 object-contain print:h-20 print:w-20 flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="text-center">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 print:text-black">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 italic print:text-gray-600">
            {SCHOOL_INFO.tagline}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 print:text-gray-500">
            {SCHOOL_INFO.address}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-500 print:text-gray-500">
            Phone: {SCHOOL_INFO.phone} | Email: {SCHOOL_INFO.email}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-6 text-[10px] sm:text-xs font-medium text-gray-600 print:text-gray-700">
        <span>
          Reg. No:{" "}
          <span className="font-semibold">{SCHOOL_INFO.registrationNo}</span>
        </span>
        <span>
          Affiliation No:{" "}
          <span className="font-semibold">{SCHOOL_INFO.affiliationNo}</span>
        </span>
        <span>
          Website:{" "}
          <span className="font-semibold">{SCHOOL_INFO.website}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
export default function FinalDateSheet() {
  const [selectedClass, setSelectedClass] = useState<FilterValue>("all");
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const isSingleClass = selectedClass !== "all";
  const filteredSchedule = isSingleClass
    ? getFilteredSchedule(selectedClass as ClassKey)
    : EXAM_SCHEDULE;

  const classLabel = getClassLabel(selectedClass);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Print Styles ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute; left: 0; top: 0; width: 100%;
            padding: 20px 30px;
            font-size: 12px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print { display: none !important; }
          .print-break { page-break-after: always; }
          @page { size: A4 portrait; margin: 10mm 15mm; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333 !important; padding: 6px 8px !important; text-align: center; }
          th { background-color: #eef2ff !important; font-weight: 700; }
          .badge-print { border: none !important; background: none !important; padding: 0 !important; font-weight: 500; }
        }
      `}</style>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* ── Page Title & Controls ── */}
        <div className="no-print mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-indigo-100 rounded-xl">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
                  Final Year Examination 2025-26
                </h1>
                <p className="text-xs sm:text-sm text-gray-500">
                  9th March – 27th March 2026 • Result: 31st March 2026
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Select
                value={selectedClass}
                onValueChange={(v) => setSelectedClass(v as FilterValue)}
              >
                <SelectTrigger className="w-[180px] bg-white border-2 border-indigo-500 text-gray-900 font-medium shadow-sm">
                  <GraduationCap className="h-4 w-4 mr-2 text-indigo-600" />
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  {CLASS_OPTIONS.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer hover:bg-indigo-50 focus:bg-indigo-50 data-[state=checked]:bg-indigo-100 data-[state=checked]:text-indigo-900 data-[state=checked]:font-semibold"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handlePrint}
                variant="outline"
                className="gap-2 bg-white"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">
                  Print {isSingleClass ? classLabel : ""} Date Sheet
                </span>
                <span className="sm:hidden">Print</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Info Badges ── */}
        <div className="no-print flex flex-wrap gap-2 mb-4">
          <Badge
            variant="outline"
            className="gap-1 bg-white border-gray-300"
          >
            <BookOpen className="h-3 w-3" /> Exam Day
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 bg-white border-gray-300"
          >
            <Clock className="h-3 w-3" /> Break / Prep Day
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 bg-white border-gray-300"
          >
            <Sun className="h-3 w-3" /> Holiday
          </Badge>
          <Badge
            variant="outline"
            className="gap-1 bg-white border-gray-300 font-bold"
          >
            <Trophy className="h-3 w-3" /> Result Day
          </Badge>
        </div>

        {/* ── Printable Area ── */}
        <div id="print-area" ref={printRef}>
          {/* School Header (visible in print always, screen only when filtered) */}
          <div className={isSingleClass ? "" : "hidden print:block"}>
            <SchoolHeader />
            <h2 className="text-center text-lg font-bold mb-1 text-gray-900 print:text-black">
              Final Year Examination Date Sheet 2025-26
            </h2>
            {isSingleClass && (
              <p className="text-center text-base font-semibold mb-3 text-gray-700 print:text-black">
                Class: {classLabel}
              </p>
            )}
          </div>

          {/* ── Selected Class Highlight Banner ── */}
          {isSingleClass && (
            <div className="no-print mb-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 text-white rounded-lg shadow-sm">
              <GraduationCap className="h-5 w-5" />
              <span className="font-semibold text-base">Viewing: {classLabel}</span>
            </div>
          )}

          <Card className="shadow-none border border-gray-200 print:shadow-none print:border-none">
            <CardHeader className="no-print pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-700" />
                {isSingleClass
                  ? `${classLabel} — Exam Schedule`
                  : "Complete Exam Schedule"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 sm:p-2">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100 print:bg-gray-100">
                      <TableHead className="font-bold text-center w-[70px] sm:w-[80px] text-xs sm:text-sm">
                        Date
                      </TableHead>
                      <TableHead className="font-bold text-center w-[40px] sm:w-[50px] text-xs sm:text-sm">
                        Day
                      </TableHead>
                      {isSingleClass ? (
                        <TableHead className="font-bold text-center">
                          Subject
                        </TableHead>
                      ) : (
                        <>
                          <TableHead className="font-bold text-center text-xs">
                            Pre-N
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            Nur
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            LKG
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            UKG
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            I
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            II
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            III
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            IV
                          </TableHead>
                          <TableHead className="font-bold text-center text-xs">
                            V
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSchedule.map((row, idx) => (
                      <TableRow
                        key={idx}
                        className={`${getRowStyle(row.type, idx)} text-center`}
                      >
                        <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap px-1 sm:px-4">
                          {row.date}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm px-1 sm:px-4">{row.day}</TableCell>
                        {isSingleClass ? (
                          <TableCell>
                            <span className="print:hidden">
                              <SubjectBadge
                                subject={row[selectedClass as ClassKey]}
                              />
                            </span>
                            <span className="hidden print:inline badge-print">
                              {row[selectedClass as ClassKey]}
                            </span>
                          </TableCell>
                        ) : (
                          <>
                            {(
                              [
                                "preNursery",
                                "nursery",
                                "lkg",
                                "ukg",
                                "class1",
                                "class2",
                                "class3",
                                "class4",
                                "class5",
                              ] as ClassKey[]
                            ).map((cls) => (
                              <TableCell key={cls} className="text-xs">
                                <span className="print:hidden">
                                  <SubjectBadge subject={row[cls]} />
                                </span>
                                <span className="hidden print:inline badge-print">
                                  {row[cls]}
                                </span>
                              </TableCell>
                            ))}
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* ── Print Footer ── */}
          <div className="hidden print:block mt-8">
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto mb-1" />
                <p className="font-semibold">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto mb-1" />
                <p className="font-semibold">{SCHOOL_INFO.principalName}</p>
                <p className="text-xs">Principal</p>
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-6">
              {SCHOOL_INFO.name} | {SCHOOL_INFO.address} | {SCHOOL_INFO.phone}
            </p>
          </div>
        </div>

        {/* ── Notes Section ── */}
        <div className="no-print mt-6">
          <Card className="border border-gray-200 bg-white">
            <CardContent className="pt-4">
              <h3 className="font-semibold text-gray-800 mb-2">
                📋 Important Notes
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>
                  Pre Nursery to Class I: Exams finish by{" "}
                  <strong>20th March</strong>
                </li>
                <li>
                  Class II to Class V: Exams finish by{" "}
                  <strong>27th March</strong>
                </li>
                <li>
                  <strong>Computer + Drawing</strong> are combined on the same
                  day for Pre Nursery – Class I
                </li>
                <li>Sundays are holidays — no exams scheduled</li>
                <li>
                  A preparation break is given between successive exam days
                </li>
                <li>
                  Results will be declared on{" "}
                  <strong>31st March 2026 (Tuesday)</strong>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}