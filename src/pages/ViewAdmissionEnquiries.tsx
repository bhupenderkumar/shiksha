import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ButtonWithIcon } from "@/components/ui/button-with-icon";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { PageAnimation } from "@/components/ui/page-animation";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { admissionService } from "@/services/admissionService";
import { ProspectiveStudent, EnquiryStatus, RequiredDocument } from "@/types/admission";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Mail,
  Phone,
  Search,
  User,
  School,
  Clock,
  PlayCircle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageCircle,
  Calendar as CalendarIcon,
  Eye,

  RefreshCw,
} from "lucide-react";
import { ADMISSION_STATUS } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { useHotkeys } from 'react-hotkeys-hook';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { FilteredEnquiry, SearchParams } from '@/types/admission';
import { useMediaQuery } from '@/hooks/use-media-query';

type SortField = 'applieddate' | 'studentname' | 'status' | 'lastupdatedate';

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

const PAGE_SIZE = 10;

const REQUIRED_DOCUMENTS = [
  'birth_certificate',
  'transfer_certificate', 
  'report_card',
  'medical_records',
  'address_proof',
  'student_photo',
  'father_photo',
  'mother_photo'
] as const;

const ViewAdmissionEnquiries: React.FC = () => {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<FilteredEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    limit: 10,
    status: [],
    searchTerm: '',
  });
  const [total, setTotal] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sort, setSort] = useState<SortConfig>({
    field: 'applieddate',
    direction: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingDocumentId, setLoadingDocumentId] = useState<string | null>(null);
  const [documentCounts, setDocumentCounts] = useState<Record<string, number>>({});
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchParams.searchTerm, 300);

  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');

  useEffect(() => {
    fetchEnquiries();
  }, [searchParams.status, searchParams.page, dateRange, sort, debouncedSearchTerm]);

  useHotkeys('ctrl+f', (e) => {
    e.preventDefault();
    document.querySelector<HTMLInputElement>('[name="search"]')?.focus();
  });

  useHotkeys('esc', () => {
    setQuickViewId(null);
  });

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const result = await admissionService.getAllEnquiries(searchParams);
      setEnquiries(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAdmission = (id: string) => {
    navigate(`/admission/process/${id}`);
  };

  const handleStatusUpdate = async (id: string, newStatus: EnquiryStatus) => {
    try {
      await admissionService.updateEnquiryStatus(id, newStatus);
      await fetchEnquiries();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleSort = (field: SortField) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleScheduleInterview = (id: string) => {
    navigate(`/admission/process/${id}?action=schedule`);
  };

  const handleViewDocuments = async (id: string) => {
    try {
      const documents = await admissionService.getAllDocuments(id);
      // Get the first submitted document
      const firstDoc = Object.values(documents).find(doc => doc.submitted.length > 0);
      if (firstDoc?.submitted[0]?.fileName) {
        const url = await admissionService.getDocumentUrl(firstDoc.submitted[0].fileName);
        window.open(url, '_blank');
      } else {
        toast.error('No documents found');
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleAddCommunication = (id: string) => {
    navigate(`/admission-progress/${id}?tab=communication`);
  };

  const handleBatchStatusUpdate = async (newStatus: EnquiryStatus) => {
    try {
      await Promise.all(
        selectedIds.map(id => admissionService.updateEnquiryStatus(id, newStatus))
      );
      await fetchEnquiries();
      setSelectedIds([]);
      toast.success(`Updated ${selectedIds.length} enquiries`);
    } catch (error) {
      toast.error("Failed to update selected enquiries");
    }
  };

  const handleQuickMessage = (id: string) => {
    navigate(`/admission/process/${id}?tab=communications`);
  };


  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: RequiredDocument,
    prospectiveStudentId: string
  ) => {
    try {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      // Convert FileList to array for multiple file handling
      const fileArray = Array.from(files);
      const uploadPromises = fileArray.map(file =>
        admissionService.uploadDocument(prospectiveStudentId, file, documentType)
      );

      toast.promise(Promise.all(uploadPromises), {
        loading: 'Uploading documents...',
        success: 'Documents uploaded successfully',
        error: 'Failed to upload documents'
      });

      // Refresh documents after upload
      await fetchDocuments(prospectiveStudentId);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload documents');
    }
  };

  const renderDocumentUpload = (documentType: RequiredDocument, prospectiveStudentId: string) => (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        multiple
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => handleFileUpload(e, documentType, prospectiveStudentId)}
        className="max-w-xs"
      />
      <ButtonWithIcon
        variant="outline"
        size="sm"
        onClick={() => fetchDocuments(prospectiveStudentId)}
        icon={<RefreshCw className="h-4 w-4" />}
      >
        Refresh
      </ButtonWithIcon>
    </div>
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: EnquiryStatus) => {
    switch (status) {
      case "NEW":
        return "bg-yellow-100 text-yellow-800";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "SCHEDULED_INTERVIEW":
        return "bg-purple-100 text-purple-800";
      case "PENDING_DOCUMENTS":
        return "bg-orange-100 text-orange-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "ENROLLED":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sort.field !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sort.direction === 'asc' ? '↑' : '↓';
  };

  const getProcessInfo = (enquiry: FilteredEnquiry) => {
    if (!enquiry.AdmissionProcess) return null;
    
    const process = enquiry.AdmissionProcess;
    return {
      date: process.interviewDate ? formatDate(process.interviewDate) : 'No interview scheduled',
      notes: process.interviewNotes ?
        process.interviewNotes.slice(0, 50) + (process.interviewNotes.length > 50 ? '...' : '') :
        'No interview notes'
    };
  };

  const QuickViewDialog = () => {
    const enquiry = enquiries.find(e => e.id === quickViewId);
    if (!enquiry) return null;

    return (
      <Dialog open={!!quickViewId} onOpenChange={() => setQuickViewId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Quick View - {enquiry.studentName}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-2">Student Details</h3>
            </Card>
            <Card className="p-4">
              <h3 className="font-medium mb-2">Latest Communications</h3>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const TableSkeleton = () => (
    <>
      {Array(5).fill(0).map((_, i) => (
        <TableRow key={i}>
          <TableCell colSpan={8}>
            <Skeleton className="h-12 w-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  // Columns configuration based on screen size
  const getColumns = () => {
    const baseColumns = [
      {
        header: 'Student Name',
        accessorKey: 'studentName',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium">{row.original.studentName}</span>
            {isMobile && (
              <>
                <span className="text-sm text-gray-500">{row.original.email}</span>
                <Badge variant={getStatusVariant(row.original.status)}>
                  {row.original.status}
                </Badge>
              </>
            )}
          </div>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => !isMobile && (
          <Badge variant={getStatusVariant(row.original.status)}>
            {row.original.status}
          </Badge>
        ),
      },
    ];

    if (!isMobile) {
      baseColumns.push(
        {
          header: 'Grade',
          accessorKey: 'gradeApplying',
        },
        {
          header: 'Applied Date',
          accessorKey: 'appliedDate',
          cell: ({ row }) => new Date(row.original.appliedDate).toLocaleDateString(),
        }
      );
    }

    if (!isMobile && !isTablet) {
      baseColumns.push(
        {
          header: 'Parent Name',
          accessorKey: 'parentName',
        },
        {
          header: 'Contact',
          accessorKey: 'contactNumber',
        }
      );
    }

    return baseColumns;
  };

  // Function to get status badge variant
  const getStatusVariant = (status: string) => {
    const variants = {
      [ADMISSION_STATUS.NEW]: 'default',
      [ADMISSION_STATUS.IN_PROGRESS]: 'warning',
      [ADMISSION_STATUS.ACCEPTED]: 'success',
      [ADMISSION_STATUS.REJECTED]: 'destructive',
    };
    return variants[status] || 'default';
  };

  return (
    <PageAnimation>
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => navigate(-1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                <h1 className="text-3xl font-bold">Admission Enquiries</h1>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge>{selectedIds.length} selected</Badge>
                  <Select
                    onValueChange={(value) => handleBatchStatusUpdate(value as EnquiryStatus)}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Update selected status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(ADMISSION_STATUS).map(status => (
                        <SelectItem key={status} value={status}>
                          {status.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear selection
                  </Button>
                </div>
              )}
            </div>

            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    name="search"
                    placeholder="Search enquiries... (Ctrl+F)"
                    value={searchParams.searchTerm}
                    onChange={(e) => {
                      setSearchParams(prev => ({
                        ...prev,
                        searchTerm: e.target.value
                      }));
                    }}
                    className="pl-10"
                  />
                </div>
                
                <DateRangePicker
                  value={dateRange}
                  onChange={(newRange) => {
                    setDateRange(newRange);
                    setSearchParams(prev => ({
                      ...prev,
                      page: 1
                    }));
                  }}
                />

                <Select
                  value={searchParams.status?.[0] || ''}
                  onValueChange={(value) => {
                    setSearchParams(prev => ({
                      ...prev,
                      status: value ? [value] : []
                    }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    {Object.values(ADMISSION_STATUS).map(status => (
                      <SelectItem key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchParams(prev => ({
                        ...prev,
                        searchTerm: '',
                        status: [],
                        dateRange: undefined,
                        page: 1
                      }));
                    }}
                  >
                    Clear filters
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {!isMobile && (
                      <TableCell className="w-[30px]">
                        <Checkbox
                          checked={selectedIds.length === enquiries.length}
                          onCheckedChange={(checked) => {
                            setSelectedIds(checked ? enquiries.map(e => e.id) : []);
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>Student Name</TableCell>
                    {!isMobile && <TableCell>Status</TableCell>}
                    {!isMobile && <TableCell>Grade</TableCell>}
                    {!isMobile && <TableCell>Applied Date</TableCell>}
                    {!isMobile && !isTablet && <TableCell>Parent Name</TableCell>}
                    {!isMobile && !isTablet && <TableCell>Contact</TableCell>}
                    <TableCell className="text-right">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isMobile ? 3 : isTablet ? 6 : 8}
                        className="text-center h-24"
                      >
                        No enquiries found
                      </TableCell>
                    </TableRow>
                  ) : (
                    enquiries.map((enquiry) => (
                      <TableRow
                        key={enquiry.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/admission/${enquiry.id}`)}
                      >
                        {!isMobile && (
                          <TableCell className="w-[30px]">
                            <Checkbox
                              checked={selectedIds.includes(enquiry.id)}
                              onCheckedChange={(checked) => {
                                setSelectedIds(prev =>
                                  checked
                                    ? [...prev, enquiry.id]
                                    : prev.filter(id => id !== enquiry.id)
                                );
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{enquiry.studentName}</span>
                            {isMobile && (
                              <>
                                <span className="text-sm text-gray-500">
                                  {enquiry.email}
                                </span>
                                <Badge variant={getStatusVariant(enquiry.status)}>
                                  {enquiry.status}
                                </Badge>
                              </>
                            )}
                          </div>
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            <Badge variant={getStatusVariant(enquiry.status)}>
                              {enquiry.status}
                            </Badge>
                          </TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>{enquiry.gradeApplying}</TableCell>
                        )}
                        {!isMobile && (
                          <TableCell>
                            {new Date(enquiry.appliedDate).toLocaleDateString()}
                          </TableCell>
                        )}
                        {!isMobile && !isTablet && (
                          <TableCell>{enquiry.parentName}</TableCell>
                        )}
                        {!isMobile && !isTablet && (
                          <TableCell>{enquiry.contactNumber}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickMessage(enquiry.id);
                                  }}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick message</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setQuickViewId(enquiry.id);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick view</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {!loading && enquiries.length > 0 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchParams(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={searchParams.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {searchParams.page} of {totalPages}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({total} total)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchParams(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                disabled={searchParams.page === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          <QuickViewDialog />
        </motion.div>
      </div>
    </PageAnimation>
  );

};

export default ViewAdmissionEnquiries;
