import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { admissionTestResultService, type AdmissionTestResultRow } from '@/services/admissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  AlertCircle,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  X,
  Clock,
  Trophy,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { CLASS_LEVEL_LABELS } from '@/components/admission-tests/types';
import type { ClassLevel } from '@/components/admission-tests/types';

const CLASS_LEVEL_OPTIONS: { label: string; value: ClassLevel }[] = [
  { label: 'Pre Nursery', value: 'pre-nursery' },
  { label: 'Nursery', value: 'nursery' },
  { label: 'KG', value: 'kg' },
  { label: 'Class 1', value: 'class-1' },
];

function getScoreBadge(percentage: number) {
  if (percentage >= 90) return { variant: 'success' as const, label: 'Excellent' };
  if (percentage >= 70) return { variant: 'default' as const, label: 'Very Good' };
  if (percentage >= 50) return { variant: 'secondary' as const, label: 'Good' };
  return { variant: 'destructive' as const, label: 'Needs Improvement' };
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

const AdmissionTestResults = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AdmissionTestResultRow[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (selectedLevel !== 'all') params.classLevel = selectedLevel;

      const result = await admissionTestResultService.getAllResults(params as any);
      setResults(result.results);
      setTotalResults(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch test results');
    } finally {
      setLoading(false);
    }
  }, [page, searchText, selectedLevel]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const totalPages = Math.ceil(totalResults / limit);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchResults();
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedLevel('all');
    setPage(1);
  };

  const hasActiveFilters = searchText || selectedLevel !== 'all';

  // Compute stats from current page results
  const avgPercentage = results.length > 0
    ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
    : 0;

  if (error) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<AlertCircle className="w-12 h-12" />}
          title="Error"
          description={error}
          action={
            <Button onClick={fetchResults}>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      <PageHeader
        title="Admission Test Results"
        subtitle={`${totalResults} total ${totalResults === 1 ? 'result' : 'results'}`}
        icon={<GraduationCap className="text-primary-500" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={fetchResults}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/admission-test')}>
              + New Test
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-1.5 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1.5 block">Class Level</label>
              <Select value={selectedLevel} onValueChange={(v) => { setSelectedLevel(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {CLASS_LEVEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0">
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CLASS_LEVEL_OPTIONS.map((level) => {
          const count = results.filter((r) => r.classLevel === level.value).length;
          return (
            <Card key={level.value} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setSelectedLevel(level.value); setPage(1); }}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{level.label}</p>
                <p className="text-2xl font-bold mt-1">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-12 h-12" />}
          title="No test results found"
          description={hasActiveFilters
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'No admission tests have been conducted yet.'}
          action={hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          ) : (
            <Button onClick={() => navigate('/admission-test')}>
              Conduct a Test
            </Button>
          )}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class Level</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => {
                    const scoreBadge = getScoreBadge(result.percentage);
                    return (
                      <TableRow key={result.id}>
                        <TableCell className="font-medium">{result.studentName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CLASS_LEVEL_LABELS[result.classLevel as ClassLevel] || result.classLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{result.correctAnswers}</span>
                            <span className="text-muted-foreground">/</span>
                            <span>{result.totalQuestions}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${
                            result.percentage >= 70 ? 'text-green-600' :
                            result.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {result.percentage}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(result.timeTaken)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {result.createdAt ? format(new Date(result.createdAt), 'dd MMM yyyy, HH:mm') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant={scoreBadge.variant as any}>
                            {scoreBadge.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {results.map((result) => {
              const scoreBadge = getScoreBadge(result.percentage);
              return (
                <Card key={result.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{result.studentName}</h3>
                        <Badge variant="outline" className="mt-1">
                          {CLASS_LEVEL_LABELS[result.classLevel as ClassLevel] || result.classLevel}
                        </Badge>
                      </div>
                      <Badge variant={scoreBadge.variant as any}>
                        {scoreBadge.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-muted rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                        </div>
                        <p className={`text-lg font-bold ${
                          result.percentage >= 70 ? 'text-green-600' :
                          result.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{result.percentage}%</p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-lg font-bold">{result.correctAnswers}/{result.totalQuestions}</p>
                        <p className="text-xs text-muted-foreground">Correct</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-blue-500" />
                        </div>
                        <p className="text-lg font-bold">{formatTime(result.timeTaken)}</p>
                        <p className="text-xs text-muted-foreground">Time</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      {result.createdAt ? format(new Date(result.createdAt), 'dd MMM yyyy, HH:mm') : '-'}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalResults} results)
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdmissionTestResults;
