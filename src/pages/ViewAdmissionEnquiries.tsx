import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { admissionService } from '@/services/admissionService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AttachmentsList } from '@/components/ui/AttachmentsList';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Book,
  Users,
  Paperclip,
  Eye,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/lib/auth-provider';
import Layout from '@/components/Layout';
import { ADMISSION_STATUS } from '@/lib/constants';
import type { ProspectiveStudent, SearchParams } from '@/types/admission';

interface EnquiryListProps {
  enquiries: ProspectiveStudent[];
  onViewClick: (id: string) => void;
}

const EnquiryList: React.FC<EnquiryListProps> = ({ enquiries, onViewClick }) => {
  if (enquiries.length === 0) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No enquiries found"
        description="There are no admission enquiries matching your criteria."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {enquiries.map((enquiry) => (
        <Card key={enquiry.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              {enquiry.studentName}
            </CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="w-4 h-4 mr-1" />
              {enquiry.parentName}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Book className="w-4 h-4 mr-2" />
                Grade {enquiry.gradeApplying}
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {format(enquiry.appliedDate, 'PPP')}
              </div>
              <div className="flex items-center text-sm">
                <Clock className="w-4 h-4 mr-2" />
                {format(enquiry.lastUpdateDate, 'PPP')}
              </div>
              <Badge
                variant={enquiry.status === ADMISSION_STATUS.NEW ? 'default' :
                        enquiry.status === ADMISSION_STATUS.IN_PROGRESS ? 'secondary' :
                        enquiry.status === ADMISSION_STATUS.APPROVED ? 'success' : 'destructive'}
                className="mt-2"
              >
                {enquiry.status}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4"
                onClick={() => onViewClick(enquiry.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const ViewAdmissionEnquiries = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<ProspectiveStudent[]>([]);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 9,
    sortBy: 'applieddate',
    sortOrder: 'desc'
  });

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const result = await admissionService.getAllEnquiries(searchParams);
        setEnquiries(result.enquiries);
        setTotalEnquiries(result.total);
        setCurrentPage(result.page);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch enquiries');
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [searchParams]);

  const handleViewClick = (id: string) => {
    navigate(`/admission/enquiry/${id}`);
  };

  const handlePageChange = (page: number) => {
    setSearchParams(prev => ({ ...prev, page }));
  };

  const handleSearch = (search: string) => {
    setSearchParams(prev => ({ ...prev, search, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setSearchParams(prev => ({ ...prev, status, page: 1 }));
  };

  const handleDateFilter = (fromDate?: Date, toDate?: Date) => {
    setSearchParams(prev => ({ ...prev, fromDate, toDate, page: 1 }));
  };

  const handleGradeFilter = (grade: string) => {
    setSearchParams(prev => ({ ...prev, grade, page: 1 }));
  };

  if (error) {
    return (
      <Layout>
        <div className="p-4">
          <EmptyState
            icon={AlertCircle}
            title="Error"
            description={error}
            action={
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            }
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admission Enquiries</h1>
          <Button onClick={() => navigate('/admission/new')}>
            New Enquiry
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            {/* Add your filter components here */}
          </CardContent>
        </Card>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <EnquiryList
              enquiries={enquiries}
              onViewClick={handleViewClick}
            />
            {/* Add pagination component here */}
          </>
        )}
      </div>
    </Layout>
  );
};

export default ViewAdmissionEnquiries;
