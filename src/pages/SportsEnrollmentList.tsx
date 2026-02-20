import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { SCHOOL_INFO } from '@/lib/constants';
import { sportsEnrollmentService, type SportsEnrollment } from '@/services/sportsEnrollmentService';

export default function SportsEnrollmentList() {
  const [enrollments, setEnrollments] = useState<SportsEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');

  useEffect(() => {
    const fetchEnrollments = async () => {
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
    fetchEnrollments();
  }, []);

  // Unique class names for filter
  const classNames = useMemo(() => {
    const names = [...new Set(enrollments.map((e) => e.className))].sort();
    return names;
  }, [enrollments]);

  // Filtered enrollments
  const filtered = useMemo(() => {
    return enrollments.filter((e) => {
      const matchesSearch =
        !search ||
        e.studentName.toLowerCase().includes(search.toLowerCase()) ||
        e.parentName.toLowerCase().includes(search.toLowerCase()) ||
        e.contactNumber.includes(search);
      const matchesClass = classFilter === 'all' || e.className === classFilter;
      return matchesSearch && matchesClass;
    });
  }, [enrollments, search, classFilter]);

  // Stats
  const totalCount = enrollments.length;
  const classBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    enrollments.forEach((e) => {
      map[e.className] = (map[e.className] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [enrollments]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
          <Link to="/sports-week" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src="/assets/images/logo.PNG" alt="Logo" className="h-8 w-8 object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs sm:text-sm font-bold">{SCHOOL_INFO.name}</span>
            </div>
          </Link>
          <div className="flex gap-2 items-center">
            <Link to="/sports-week/enrollments/grouped">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm gap-1">
                📊 Grouped View
              </Button>
            </Link>
            <Link to="/sports-week">
              <Button variant="outline" size="sm" className="text-xs sm:text-sm gap-1">
                🏆 Sports Week
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                🏠 Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-green-500/5 to-emerald-500/5 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <span className="text-5xl sm:text-6xl inline-block mb-3">📋</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Sports Week 2026 — Enrollments
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              List of all enrolled students for Annual Sports Week
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-extrabold text-primary">{totalCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Enrolled</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-extrabold text-green-600">{classNames.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Classes</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-extrabold text-orange-500">{filtered.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Showing</p>
          </motion.div>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-card border rounded-xl p-4 text-center"
          >
            <p className="text-3xl font-extrabold text-blue-500">
              {enrollments.filter((e) => e.selectedGames.length > 0).length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">With Events</p>
          </motion.div>
        </div>
      </section>

      {/* Class Breakdown */}
      {classBreakdown.length > 0 && (
        <section className="container mx-auto px-4 pb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {classBreakdown.map(([cls, count]) => (
              <Badge
                key={cls}
                variant="outline"
                className={cn(
                  'cursor-pointer transition-all',
                  classFilter === cls
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:border-primary/50'
                )}
                onClick={() => setClassFilter(classFilter === cls ? 'all' : cls)}
              >
                {cls}: {count}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Search & Filter */}
      <section className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <div className="flex-1">
            <Input
              placeholder="🔍 Search by student, parent name, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-card border-border">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border shadow-lg">
              <SelectItem value="all">All Classes</SelectItem>
              {classNames.map((cls) => (
                <SelectItem key={cls} value={cls}>
                  {cls}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Enrollment List */}
      <section className="container mx-auto px-4 py-4 pb-12">
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
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl inline-block mb-4">📭</span>
            <p className="text-muted-foreground">
              {enrollments.length === 0
                ? 'No enrollments yet. Be the first to enroll!'
                : 'No results match your search.'}
            </p>
            {enrollments.length === 0 && (
              <Link to="/sports-week#enroll" className="mt-4 inline-block">
                <Button className="gap-2">
                  ✍️ Enroll Now
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                  className="bg-card border rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    {/* Serial Number & Avatar */}
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base truncate">
                          👦 {enrollment.studentName}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          👨‍👩‍👧 {enrollment.parentName} &nbsp;•&nbsp; 📱 {enrollment.contactNumber}
                        </p>
                      </div>
                    </div>

                    {/* Class & Status */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        🎓 {enrollment.className}
                      </Badge>
                      <Badge
                        className={cn(
                          'text-xs',
                          enrollment.status === 'ENROLLED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                        )}
                      >
                        {enrollment.status === 'ENROLLED' ? '✅' : '⏳'} {enrollment.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Games & Notes */}
                  {(enrollment.selectedGames.length > 0 || enrollment.specialNotes) && (
                    <div className="mt-3 pt-3 border-t">
                      {enrollment.selectedGames.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="text-xs text-muted-foreground mr-1">🏅 Events:</span>
                          {enrollment.selectedGames.map((game, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800">
                              🏅 {game}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {enrollment.specialNotes && (
                        <p className="text-xs text-muted-foreground">
                          📝 {enrollment.specialNotes}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Enrolled Date */}
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Floating Enroll Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link to="/sports-week#enroll">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
