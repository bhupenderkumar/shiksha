import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { admissionService } from "@/services/admissionService";
import { ProspectiveStudent, EnquiryStatus } from "@/types/admission";
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
import { Tooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FilteredEnquiry extends ProspectiveStudent {
  AdmissionProcess: {
    documentsSubmitted: any;
    interviewDate: string | null;
  } | null;
  AdmissionCommunication?: Array<{
    communicationDate: Date;
    notes: string;
  }>;
}

type SortField = 'appliedDate' | 'studentName' | 'status' | 'lastUpdateDate';

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

const PAGE_SIZE = 10;

export default function ViewAdmissionEnquiries() {
  const navigate = useNavigate();
  const [enquiries, setEnquiries] = useState<FilteredEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sort, setSort] = useState<SortConfig>({
    field: 'appliedDate',
    direction: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [quickViewId, setQuickViewId] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, currentPage, dateRange, sort, debouncedSearchTerm]);

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
      const { data, total } = await admissionService.getAllEnquiries({
        status: statusFilter !== "all" ? [statusFilter as EnquiryStatus] : undefined,
        page: currentPage,
        limit: PAGE_SIZE,
        dateRange: dateRange?.from && dateRange.to ? {
          start: dateRange.from,
          end: dateRange.to
        } : undefined,
        searchTerm: debouncedSearchTerm || undefined
      });
      setEnquiries(data);
      setTotalCount(total);
    } catch (error) {
      console.error("Error fetching enquiries:", error);
      toast.error("Failed to load enquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeAdmission = (id: string) => {
    navigate(`/admission-progress/${id}`);
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
    navigate(`/admission-progress/${id}?action=schedule`);
  };

  const handleViewDocuments = (id: string) => {
    navigate(`/admission-progress/${id}?tab=documents`);
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
    navigate(`/admission-progress/${id}?tab=communications`);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

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

  const getLastCommunication = (enquiry: FilteredEnquiry) => {
    if (!enquiry.AdmissionCommunication?.length) return null;
    const lastComm = enquiry.AdmissionCommunication.sort(
      (a, b) => b.communicationDate.getTime() - a.communicationDate.getTime()
    )[0];
    return {
      date: formatDate(lastComm.communicationDate),
      notes: lastComm.notes.slice(0, 50) + (lastComm.notes.length > 50 ? '...' : '')
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
    <div className="space-y-3">
      {Array(5).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-12 w-full" />
        </div>
      ))}
    </div>
  );

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
              <h1 className="text-3xl font-bold">Admission Enquiries</h1>
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
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                
                <DateRangePicker
                  value={dateRange}
                  onChange={(newRange) => {
                    setDateRange(newRange);
                    setCurrentPage(1);
                  }}
                />

                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
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
                      setSearchTerm("");
                      setStatusFilter("all");
                      setDateRange(undefined);
                      setCurrentPage(1);
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
                    <TableHead className="w-[30px]">
                      <Checkbox
                        checked={selectedIds.length === enquiries.length}
                        onCheckedChange={(checked) => {
                          setSelectedIds(
                            checked ? enquiries.map(e => e.id) : []
                          );
                        }}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('studentName')}
                        className="flex items-center"
                      >
                        Student Details {getSortIcon('studentName')}
                      </Button>
                    </TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Grade & School</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('status')}
                        className="flex items-center"
                      >
                        Status {getSortIcon('status')}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('appliedDate')}
                        className="flex items-center"
                      >
                        Applied Date {getSortIcon('appliedDate')}
                      </Button>
                    </TableHead>
                    <TableHead>Last Interaction</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableSkeleton />
                  ) : enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-8 w-8 text-gray-400" />
                          <p>No enquiries found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    enquiries.map((enquiry) => (
                      <TableRow
                        key={enquiry.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => setQuickViewId(enquiry.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.includes(enquiry.id)}
                            onCheckedChange={(checked) => {
                              setSelectedIds(prev =>
                                checked
                                  ? [...prev, enquiry.id]
                                  : prev.filter(id => id !== enquiry.id)
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 mt-1" />
                            <div>
                              <div className="font-medium">
                                {enquiry.studentName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {enquiry.parentName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span className="text-sm">{enquiry.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{enquiry.contactNumber}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <School className="h-4 w-4" />
                              <span className="text-sm">Grade {enquiry.gradeApplying}</span>
                            </div>
                            {enquiry.currentSchool && (
                              <div className="text-sm text-muted-foreground">
                                {enquiry.currentSchool}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              enquiry.status
                            )}`}
                          >
                            {enquiry.status.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">
                              {formatDate(enquiry.appliedDate)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getLastCommunication(enquiry) ? (
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {getLastCommunication(enquiry)?.date}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {getLastCommunication(enquiry)?.notes}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              No communications yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col md:flex-row gap-2 justify-end">
                            <Tooltip content="View Documents">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDocuments(enquiry.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Send Message">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleQuickMessage(enquiry.id)}
                              >
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Resume Process">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResumeAdmission(enquiry.id)}
                              >
                                <PlayCircle className="h-4 w-4" />
                              </Button>
                            </Tooltip>
                            <ButtonWithIcon
                              size="sm"
                              variant="outline"
                              onClick={() => handleScheduleInterview(enquiry.id)}
                              leftIcon={<CalendarIcon className="h-4 w-4" />}
                            >
                              Schedule
                            </ButtonWithIcon>
                            <ButtonWithIcon
                              size="sm"
                              onClick={() => handleAddCommunication(enquiry.id)}
                              leftIcon={<MessageCircle className="h-4 w-4" />}
                            >
                              Chat
                            </ButtonWithIcon>
                            <Select
                              value={enquiry.status}
                              onValueChange={(value) =>
                                handleStatusUpdate(enquiry.id, value as EnquiryStatus)
                              }
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue placeholder="Update status" />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ADMISSION_STATUS).map(status => (
                                  <SelectItem key={status} value={status}>
                                    {status.replace(/_/g, ' ')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({totalCount} total)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
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
}
