import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { admissionService } from '@/services/admissionService';
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
  Eye,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  X,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMISSION_STATUS } from '@/lib/constants';
import type { ProspectiveStudent } from '@/types/admission';

const STATUS_OPTIONS = Object.entries(ADMISSION_STATUS).map(([key, value]) => ({
  label: key.replace(/_/g, ' '),
  value,
}));

const GRADE_OPTIONS = [
  'Nursery', 'LKG', 'UKG',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];

function getStatusVariant(status: string) {
  switch (status) {
    case ADMISSION_STATUS.NEW:
      return 'default';
    case ADMISSION_STATUS.IN_REVIEW:
      return 'secondary';
    case ADMISSION_STATUS.SCHEDULED_INTERVIEW:
      return 'outline';
    case ADMISSION_STATUS.PENDING_DOCUMENTS:
      return 'warning';
    case ADMISSION_STATUS.APPROVED:
      return 'success';
    case ADMISSION_STATUS.REJECTED:
      return 'destructive';
    case ADMISSION_STATUS.ENROLLED:
      return 'success';
    default:
      return 'default';
  }
}

const AdmissionQueries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<ProspectiveStudent[]>([]);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  const fetchEnquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, unknown> = {
        page,
        limit,
        sortBy: 'appliedDate',
        sortOrder: 'desc',
      };
      if (searchText.trim()) params.search = searchText.trim();
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedGrade !== 'all') params.grade = selectedGrade;

      const result = await admissionService.getAllEnquiries(params as any);
      setEnquiries(result.enquiries);
      setTotalEnquiries(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch admission queries');
    } finally {
      setLoading(false);
    }
  }, [page, searchText, selectedStatus, selectedGrade]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const totalPages = Math.ceil(totalEnquiries / limit);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchEnquiries();
    }
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus('all');
    setSelectedGrade('all');
    setPage(1);
  };

  const hasActiveFilters = searchText || selectedStatus !== 'all' || selectedGrade !== 'all';

  if (error) {
    return (
      <div className="p-4">
        <EmptyState
          icon={<AlertCircle className="w-12 h-12" />}
          title="Error"
          description={error}
          action={
            <Button onClick={fetchEnquiries}>
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
        title="Admission Queries"
        subtitle={`${totalEnquiries} total ${totalEnquiries === 1 ? 'query' : 'queries'}`}
        icon={<FileText className="text-primary-500" />}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm" onClick={fetchEnquiries}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" className="text-xs sm:text-sm" onClick={() => navigate('/admission-enquiry')}>
              + New Query
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
                  placeholder="Search by name, email, or phone..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select value={selectedStatus} onValueChange={(v) => { setSelectedStatus(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-40">
              <label className="text-sm font-medium mb-1.5 block">Grade</label>
              <Select value={selectedGrade} onValueChange={(v) => { setSelectedGrade(v); setPage(1); }}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {GRADE_OPTIONS.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
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
        {[
          { label: 'New', status: ADMISSION_STATUS.NEW, color: 'bg-blue-100 text-blue-800' },
          { label: 'In Review', status: ADMISSION_STATUS.IN_REVIEW, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Approved', status: ADMISSION_STATUS.APPROVED, color: 'bg-green-100 text-green-800' },
          { label: 'Rejected', status: ADMISSION_STATUS.REJECTED, color: 'bg-red-100 text-red-800' },
        ].map((item) => {
          const count = enquiries.filter((e) => e.status === item.status).length;
          return (
            <Card key={item.status} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setSelectedStatus(item.status); setPage(1); }}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className={`text-2xl font-bold mt-1 ${item.color} rounded px-2 py-0.5 inline-block`}>
                  {count}
                </p>
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
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="No admission queries found"
          description={hasActiveFilters
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'No admission queries have been submitted yet.'}
          action={hasActiveFilters ? (
            <Button variant="outline" onClick={clearFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          ) : undefined}
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
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Applied Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enquiries.map((enquiry) => (
                    <TableRow key={enquiry.id} className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/admission-enquiry/${enquiry.id}`)}>
                      <TableCell className="font-medium">{enquiry.studentName}</TableCell>
                      <TableCell>{enquiry.parentName}</TableCell>
                      <TableCell>{enquiry.gradeApplying}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{enquiry.contactNumber}</div>
                          <div className="text-muted-foreground text-xs">{enquiry.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {enquiry.appliedDate ? format(new Date(enquiry.appliedDate), 'dd MMM yyyy') : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(enquiry.status) as any}>
                          {enquiry.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm"
                          onClick={(e) => { e.stopPropagation(); navigate(`/admission-enquiry/${enquiry.id}`); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {enquiries.map((enquiry) => (
              <Card key={enquiry.id} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/admission-enquiry/${enquiry.id}`)}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{enquiry.studentName}</h3>
                      <p className="text-sm text-muted-foreground">{enquiry.parentName}</p>
                    </div>
                    <Badge variant={getStatusVariant(enquiry.status) as any}>
                      {enquiry.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div>Grade: {enquiry.gradeApplying}</div>
                    <div>{enquiry.contactNumber}</div>
                    <div className="col-span-2 text-xs">{enquiry.email}</div>
                    <div className="col-span-2 text-xs">
                      Applied: {enquiry.appliedDate ? format(new Date(enquiry.appliedDate), 'dd MMM yyyy') : '-'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalEnquiries} results)
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

export default AdmissionQueries;
