import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SCHOOL_INFO } from '@/lib/constants';
import { sportsEnrollmentService, type SportsEnrollment } from '@/services/sportsEnrollmentService';

type ViewMode = 'by-class' | 'by-sport';

export default function SportsEnrollmentGrouped() {
  const [enrollments, setEnrollments] = useState<SportsEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('by-class');

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await sportsEnrollmentService.getAllEnrollments();
        setEnrollments(data);
      } catch (err) {
        console.error('Error fetching enrollments:', err);
        setError('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Group by class
  const byClass = useMemo(() => {
    const map = new Map<string, SportsEnrollment[]>();
    enrollments.forEach((e) => {
      const key = e.className || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [enrollments]);

  // Group by sport
  const bySport = useMemo(() => {
    const map = new Map<string, SportsEnrollment[]>();
    enrollments.forEach((e) => {
      if (e.selectedGames && e.selectedGames.length > 0) {
        e.selectedGames.forEach((game) => {
          if (!map.has(game)) map.set(game, []);
          map.get(game)!.push(e);
        });
      } else {
        const key = 'No Specific Event Selected';
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(e);
      }
    });
    return [...map.entries()].sort((a, b) => {
      if (a[0] === 'No Specific Event Selected') return 1;
      if (b[0] === 'No Specific Event Selected') return -1;
      return a[0].localeCompare(b[0]);
    });
  }, [enrollments]);

  const groupedData = viewMode === 'by-class' ? byClass : bySport;

  const gradients = [
    'from-blue-500 to-cyan-400',
    'from-orange-500 to-amber-400',
    'from-green-500 to-emerald-400',
    'from-purple-500 to-violet-400',
    'from-pink-500 to-rose-400',
    'from-yellow-500 to-amber-500',
    'from-teal-500 to-cyan-500',
    'from-indigo-500 to-blue-500',
  ];

  const bgGradients = [
    'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
    'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
    'from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20',
    'from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20',
    'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20',
    'from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20',
    'from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20',
    'from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/sports-week" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/assets/images/logo.PNG" alt="Logo" className="h-8 w-8 object-contain" />
            <span className="text-xs sm:text-sm font-bold">{SCHOOL_INFO.name}</span>
          </Link>
          <div className="flex gap-2 items-center">
            <Link to="/sports-week/enrollments">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm gap-1">
                📋 All Enrollments
              </Button>
            </Link>
            <Link to="/sports-week">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                🏆 Sports Week
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <span className="text-5xl sm:text-6xl inline-block mb-3">📊</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Enrollments — Grouped View
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              {enrollments.length} students enrolled • View by class or by sport
            </p>
          </motion.div>
        </div>
      </section>

      {/* View Toggle */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex justify-center gap-2">
          <Button
            variant={viewMode === 'by-class' ? 'default' : 'outline'}
            onClick={() => setViewMode('by-class')}
            className="gap-2"
          >
            🎓 By Class
          </Button>
          <Button
            variant={viewMode === 'by-sport' ? 'default' : 'outline'}
            onClick={() => setViewMode('by-sport')}
            className="gap-2"
          >
            🏅 By Sport
          </Button>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="text-4xl inline-block"
            >
              ⏳
            </motion.div>
            <p className="text-muted-foreground mt-4">Loading enrollments...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <span className="text-4xl">❌</span>
            <p className="text-red-500 mt-4">{error}</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl inline-block mb-4">📭</span>
            <p className="text-muted-foreground">No enrollments yet.</p>
            <Link to="/sports-week#enroll" className="mt-4 inline-block">
              <Button className="gap-2">✍️ Enroll Now</Button>
            </Link>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {groupedData.map(([groupName, entries], groupIndex) => (
                  <motion.div
                    key={groupName}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(groupIndex * 0.08, 0.5) }}
                    className="rounded-2xl border-2 overflow-hidden shadow-sm"
                  >
                    {/* Group Header */}
                    <div className={cn(
                      'bg-gradient-to-r p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2',
                      gradients[groupIndex % gradients.length]
                    )}>
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {viewMode === 'by-class' ? '🎓' : '🏅'}
                        </span>
                        <div>
                          <h2 className="text-lg sm:text-xl font-extrabold text-white">
                            {groupName}
                          </h2>
                          <p className="text-white/80 text-xs sm:text-sm">
                            {entries.length} student{entries.length !== 1 ? 's' : ''} enrolled
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-white/20 text-white border-white/30 text-sm px-3 py-1 w-fit">
                        {entries.length}
                      </Badge>
                    </div>

                    {/* Entries */}
                    <div className={cn('bg-gradient-to-br', bgGradients[groupIndex % bgGradients.length])}>
                      <div className="divide-y divide-border/50">
                        {entries.map((enrollment, i) => (
                          <div
                            key={`${enrollment.id}-${i}`}
                            className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-background/40 transition-colors"
                          >
                            {/* Number + Name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {i + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {enrollment.studentName}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                  👨‍👩‍👧 {enrollment.parentName} • 📱 {enrollment.contactNumber}
                                </p>
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap flex-shrink-0">
                              {viewMode === 'by-sport' && (
                                <Badge variant="outline" className="text-[10px]">
                                  🎓 {enrollment.className}
                                </Badge>
                              )}
                              {viewMode === 'by-class' && enrollment.selectedGames.length > 0 && (
                                <>
                                  {enrollment.selectedGames.map((game, gi) => (
                                    <Badge
                                      key={gi}
                                      variant="outline"
                                      className="text-[10px] bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800"
                                    >
                                      🏅 {game}
                                    </Badge>
                                  ))}
                                </>
                              )}
                              <Badge
                                className={cn(
                                  'text-[10px]',
                                  enrollment.status === 'ENROLLED'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-700'
                                )}
                              >
                                {enrollment.status === 'ENROLLED' ? '✅' : '⏳'} {enrollment.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center pt-4"
            >
              <p className="text-xs text-muted-foreground">
                {viewMode === 'by-class'
                  ? `${byClass.length} classes • ${enrollments.length} total enrollments`
                  : `${bySport.length} events • ${enrollments.length} total enrollments`}
              </p>
            </motion.div>
          </div>
        )}
      </section>

      {/* Floating Enroll Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/sports-week#enroll">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Button
              size="lg"
              className="rounded-full shadow-lg gap-2 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              ✍️ Enroll My Child
            </Button>
          </motion.div>
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">
            © 2026 {SCHOOL_INFO.name}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
