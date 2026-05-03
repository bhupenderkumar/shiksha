import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  AlertCircle,
  Printer,
  Share2,
  Calendar,
  GraduationCap,
  User2,
  BookOpen,
  MessageCircleHeart,
  CalendarCheck2,
  Lock,
} from 'lucide-react';
import {
  monthlyRemarksService,
  type RegisterWithEntries,
} from '@/services/monthlyRemarksService';
import { normaliseClassName } from '@/lib/class-names';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

const CURRENT_AY = '2026-27';

/* ----- Sentiment classification (client-side, from remarks text + attendance) ----- */

type Sentiment = 'excellent' | 'good' | 'improving' | 'needs-support';

const NEEDS_SUPPORT_PATTERNS = [
  'cries',
  'late',
  'does not finish',
  'does not eat',
  'doesn’t finish',
  'doesn’t eat',
  "doesn't finish",
  "doesn't eat",
  'difficulty',
  'less frequently',
];

const EXCELLENT_PATTERNS = [
  'perfect',
  'wonderful',
  'fantastic',
  'very good',
  'excellent',
  'sweet',
  'thriving',
];

const IMPROVING_PATTERNS = [
  'slowly',
  'starting to',
  'making progress',
  'beginning to',
];

function matchesAny(text: string, patterns: string[]): boolean {
  return patterns.some((p) => text.includes(p));
}

function classifySentiment(
  remarks: string | null | undefined,
  parentMessage: string | null | undefined,
  attendance: number | null | undefined,
  totalWorkingDays: number | null | undefined
): Sentiment {
  const text = `${remarks ?? ''} ${parentMessage ?? ''}`.toLowerCase();

  const lowAttendance =
    attendance != null &&
    totalWorkingDays != null &&
    totalWorkingDays > 0 &&
    attendance < totalWorkingDays * 0.6;

  if (matchesAny(text, NEEDS_SUPPORT_PATTERNS) || lowAttendance) {
    return 'needs-support';
  }

  const perfectAttendance =
    attendance != null &&
    totalWorkingDays != null &&
    totalWorkingDays > 0 &&
    attendance >= totalWorkingDays;

  if (matchesAny(text, EXCELLENT_PATTERNS) || perfectAttendance) {
    return 'excellent';
  }

  if (matchesAny(text, IMPROVING_PATTERNS)) {
    return 'improving';
  }

  return 'good';
}

const SENTIMENT_META: Record<
  Sentiment,
  { emoji: string; label: string; classes: string; animate: any; transition: any }
> = {
  excellent: {
    emoji: '🌟',
    label: 'Excellent',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    animate: { rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.2, 1, 1.15, 1] },
    transition: { duration: 1.6, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' },
  },
  good: {
    emoji: '👍',
    label: 'Good',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    animate: { y: [0, -3, 0] },
    transition: { duration: 1.4, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' },
  },
  improving: {
    emoji: '👏',
    label: 'Improving',
    classes: 'bg-sky-50 text-sky-700 border-sky-200',
    animate: { rotate: [0, -18, 18, -12, 12, 0], scale: [1, 1.15, 1, 1.1, 1] },
    transition: { duration: 1.4, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' },
  },
  'needs-support': {
    emoji: '💛',
    label: 'Needs Support',
    classes: 'bg-rose-50 text-rose-700 border-rose-200',
    animate: { scale: [1, 1.18, 1] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
};

const SentimentBadge: React.FC<{ sentiment: Sentiment; size?: 'sm' | 'md' }> = ({
  sentiment,
  size = 'md',
}) => {
  const meta = SENTIMENT_META[sentiment];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
        meta.classes,
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
      )}
      title={meta.label}
    >
      <motion.span
        className="inline-block leading-none"
        animate={meta.animate}
        transition={meta.transition}
        style={{ transformOrigin: 'center' }}
      >
        {meta.emoji}
      </motion.span>
      <span>{meta.label}</span>
    </span>
  );
};

const MonthlyRemarksReport: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Normalise old labels (LKG/UKG) so legacy share-links keep working
  const initialClass = normaliseClassName(searchParams.get('class') || '');
  const initialMonth = searchParams.get('month') || '';
  const initialYear = searchParams.get('year') || CURRENT_AY;
  const token = searchParams.get('token') || '';

  const [data, setData] = useState<RegisterWithEntries | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-load by token (public share link)
  useEffect(() => {
    if (!token) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await monthlyRemarksService.getRegisterByToken(token);
        if (!result) {
          setError('This shared report link is invalid or has been unpublished.');
          return;
        }
        setData(result);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load report.');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  // Auto-load when class+month present in URL (without token)
  useEffect(() => {
    if (token) return;
    if (!initialClass || !initialMonth) return;
    (async () => {
      setLoading(true);
      setError(null);
      setData(null);
      try {
        const reg = await monthlyRemarksService.getRegisterByLookup(
          initialClass,
          initialMonth,
          initialYear
        );
        if (!reg) {
          setError(
            `No remarks published for ${initialClass} · ${initialMonth} (${initialYear}) yet.`
          );
          return;
        }
        const full = await monthlyRemarksService.getRegisterWithEntries(reg.id);
        setData(full);
      } catch (e: any) {
        setError(e?.message ?? 'Failed to load remarks.');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    if (!data?.share_token) {
      toast.error('Share link not available.');
      return;
    }
    const url = `${window.location.origin}/monthly-remarks?token=${data.share_token}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Monthly Remarks · ${data.class_name} · ${data.month}`,
          text: `View monthly remarks for ${data.class_name} (${data.month} ${data.academic_year})`,
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
    } catch {
      toast(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 print:bg-white">
      {/* APP-LIKE STICKY HEADER */}
      <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/95 ring-1 ring-white/30 shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
            <img
              src="/assets/images/logo.PNG"
              alt="First Step School"
              className="w-full h-full object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-blue-100/80 font-medium">
              First Step School
            </div>
            <h1 className="text-base sm:text-lg font-semibold leading-tight truncate">
              Monthly Remarks
              {data?.class_name ? ` · ${data.class_name}` : ''}
            </h1>
          </div>
          {data && (
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition flex items-center justify-center flex-shrink-0"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block text-center py-4">
        <img
          src="/assets/images/logo.PNG"
          alt="First Step School"
          className="w-16 h-16 object-contain mx-auto mb-2"
        />
        <div className="text-2xl font-serif text-slate-900">First Step School</div>
        <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">
          Student Remarks Register
          {data?.section ? ` · ${data.section}` : ''}
          {data?.page_label ? ` · ${data.page_label}` : ''}
        </div>
        <div className="w-16 h-[3px] bg-blue-600 mx-auto mt-3 rounded" />
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 pb-28 sm:pb-12 pt-4 sm:pt-6">
        {/* LOADING / ERROR */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 px-4 py-5 flex items-center gap-3 text-slate-700 mb-4"
            >
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading remarks...</span>
            </motion.div>
          )}

          {!loading && error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl px-4 py-4 flex items-start gap-3 mb-4"
            >
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REPORT */}
        <AnimatePresence>
          {!loading && data && (
            <motion.div
              key={data.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* META PILLS */}
              <div className="flex flex-wrap gap-2 mb-4 print:hidden">
                <Pill icon={<GraduationCap className="w-3 h-3" />}>{data.class_name}</Pill>
                <Pill icon={<Calendar className="w-3 h-3" />}>{data.month}</Pill>
                <Pill>{data.academic_year}</Pill>
                {data.total_present_days != null && (
                  <Pill icon={<CalendarCheck2 className="w-3 h-3" />}>
                    {data.total_present_days} working days
                  </Pill>
                )}
              </div>

              {/* DESKTOP ACTIONS */}
              <div className="hidden sm:flex justify-end gap-2 mb-3 print:hidden">
                <GhostBtn onClick={() => window.print()} icon={<Printer className="w-3.5 h-3.5" />}>
                  Print
                </GhostBtn>
                <GhostBtn onClick={handleShare} icon={<Share2 className="w-3.5 h-3.5" />}>
                  Share Link
                </GhostBtn>
              </div>

              {/* MOBILE: CARD LIST */}
              <div className="sm:hidden space-y-3 print:hidden">
                {data.entries.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                    No entries yet for this register.
                  </div>
                ) : (
                  data.entries.map((e, i) => (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.4) }}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Card header */}
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-slate-100">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
                          {e.student_name.trim().charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-slate-900 truncate text-[15px]">
                            {e.student_name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span>#{e.serial_no}</span>
                            {e.roll_no && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>Roll {e.roll_no}</span>
                              </>
                            )}
                          </div>
                        </div>
                        {e.attendance_days != null && (
                          <div className="flex flex-col items-center bg-white rounded-xl border border-blue-100 px-2.5 py-1.5 flex-shrink-0">
                            <span className="text-base font-bold text-blue-700 leading-none">
                              {e.attendance_days}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-slate-500 mt-0.5">
                              days
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Card body */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                            <BookOpen className="w-3 h-3" />
                            Status
                          </div>
                          <SentimentBadge
                            sentiment={classifySentiment(
                              e.remarks,
                              e.parent_message,
                              e.attendance_days,
                              data.total_present_days
                            )}
                            size="sm"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-500 font-medium mb-1.5">
                            <BookOpen className="w-3 h-3" />
                            Teacher's Remarks
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{e.remarks}</p>
                        </div>

                        {e.parent_message && (
                          <div className="bg-blue-50/70 border border-blue-100 border-l-[3px] border-l-blue-500 rounded-lg p-3">
                            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-blue-700 font-medium mb-1">
                              <MessageCircleHeart className="w-3 h-3" />
                              Message for Parents
                            </div>
                            <p className="text-sm text-blue-900 leading-relaxed">
                              {e.parent_message}
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* DESKTOP: TABLE */}
              <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none print:border print:rounded-none">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                      <tr>
                        <th className="text-center w-12 py-3.5 px-3 text-[11px] uppercase tracking-wider font-medium">
                          #
                        </th>
                        <th className="text-left w-56 py-3.5 px-4 text-[11px] uppercase tracking-wider font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <User2 className="w-3 h-3" /> Student
                          </span>
                        </th>
                        <th className="text-center w-20 py-3.5 px-3 text-[11px] uppercase tracking-wider font-medium">
                          Roll
                        </th>
                        <th className="text-center w-28 py-3.5 px-3 text-[11px] uppercase tracking-wider font-medium">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarCheck2 className="w-3 h-3" /> Days
                          </span>
                        </th>
                        <th className="text-left py-3.5 px-4 text-[11px] uppercase tracking-wider font-medium min-w-[260px]">
                          <span className="inline-flex items-center gap-1.5">
                            <BookOpen className="w-3 h-3" /> Teacher's Remarks
                          </span>
                        </th>
                        <th className="text-left py-3.5 px-4 text-[11px] uppercase tracking-wider font-medium min-w-[260px]">
                          <span className="inline-flex items-center gap-1.5">
                            <MessageCircleHeart className="w-3 h-3" /> Message for Parents
                          </span>
                        </th>
                        <th className="text-center w-36 py-3.5 px-3 text-[11px] uppercase tracking-wider font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.entries.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center py-10 text-slate-500">
                            No entries yet for this register.
                          </td>
                        </tr>
                      )}
                      {data.entries.map((e, i) => (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.5) }}
                          className="border-b border-slate-100 last:border-b-0 even:bg-slate-50/40 hover:bg-blue-50/40 transition-colors"
                        >
                          <td className="py-4 px-3 text-center text-sm text-slate-500 font-semibold align-top">
                            {e.serial_no}
                          </td>
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                                {e.student_name.trim().charAt(0).toUpperCase()}
                              </div>
                              <div className="font-semibold text-slate-900 text-[14px]">
                                {e.student_name}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-3 text-center align-top">
                            {e.roll_no ? (
                              <span className="inline-block bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs px-2.5 py-1 rounded-md min-w-[36px]">
                                {e.roll_no}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center align-top">
                            {e.attendance_days != null ? (
                              <span className="inline-block bg-blue-50 text-blue-700 font-semibold text-xs px-3 py-1 rounded-full border border-blue-100">
                                {e.attendance_days}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-sm text-slate-700 leading-relaxed align-top">
                            {e.remarks}
                          </td>
                          <td className="py-4 px-4 align-top">
                            {e.parent_message ? (
                              <div className="bg-blue-50/70 border border-blue-100 border-l-[3px] border-l-blue-500 rounded-lg p-2.5 flex items-start gap-2">
                                <MessageCircleHeart className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-blue-900 leading-relaxed">
                                  {e.parent_message}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-4 px-3 text-center align-top">
                            <SentimentBadge
                              sentiment={classifySentiment(
                                e.remarks,
                                e.parent_message,
                                e.attendance_days,
                                data.total_present_days
                              )}
                            />
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <footer className="text-center mt-6 text-xs text-slate-500 print:mt-4">
                First Step School &nbsp;·&nbsp; Saurabh Vihar, Jaitpur, New Delhi
                {data.section ? ` · ${data.section} Register` : ''}
              </footer>
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && !data && !error && !token && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center print:hidden"
          >
            <img
              src="/assets/images/logo.PNG"
              alt="First Step School"
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto mb-4"
            />
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-blue-600 mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
              Private Class Report
            </h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              This page is shared privately by your class teacher. Please open the
              direct link sent to your class WhatsApp group to view your child's
              monthly remarks.
            </p>
            <p className="text-xs text-slate-400 mt-4">
              If you can't find the link, kindly request it from your teacher.
            </p>
          </motion.div>
        )}
      </div>

      {/* MOBILE BOTTOM ACTION BAR (when data loaded) */}
      {data && (
        <div
          className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-3 flex gap-2 z-20 print:hidden"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={() => window.print()}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm active:scale-[0.98] transition"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button
            onClick={handleShare}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium text-sm active:scale-[0.98] transition shadow-sm"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      )}
    </div>
  );
};

/* ----- Small UI helpers ----- */

const Pill: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({
  children,
  icon,
}) => (
  <span className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
    {icon && <span className="text-blue-600">{icon}</span>}
    {children}
  </span>
);

const GhostBtn: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
}> = ({ children, onClick, icon }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium px-3 py-1.5 rounded-lg transition"
  >
    {icon}
    {children}
  </button>
);

export default MonthlyRemarksReport;
