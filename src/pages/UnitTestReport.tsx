import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/api-client';
import { SCHEMA } from '@/lib/constants';
import {
  unitTestMarksService,
  copyRequestService,
  SUBJECTS_BY_CLASS,
  type CopyRequest,
} from '@/services/unitTestMarksService';
import { useProfileAccess } from '@/services/profileService';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BarChart3,
  FileText,
  Download,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Users,
  TrendingUp,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ClassInfo {
  id: string;
  name: string;
  section: string;
}

interface ReportStudent {
  student: { id: string; name: string; admissionNumber: string } | undefined;
  subjects: Record<string, { writing: number; oral: number; total: number }>;
  grandTotal: number;
  subjectCount: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  approved: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: <Eye className="h-3 w-3" /> },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-3 w-3" /> },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
};

export default function UnitTestReport() {
  const { profile, loading: profileLoading, isAdminOrTeacher } = useProfileAccess();
  const [activeTab, setActiveTab] = useState('report');
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedClassName, setSelectedClassName] = useState('');
  const [reportData, setReportData] = useState<ReportStudent[]>([]);
  const [subjectList, setSubjectList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Copy request state
  const [copyRequests, setCopyRequests] = useState<CopyRequest[]>([]);
  const [requestFilter, setRequestFilter] = useState('all');
  const [requestClassFilter, setRequestClassFilter] = useState('all');
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [statusDialog, setStatusDialog] = useState<{ open: boolean; request: CopyRequest | null }>({
    open: false,
    request: null,
  });
  const [newStatus, setNewStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase
        .schema(SCHEMA)
        .from('Class')
        .select('id, name, section')
        .order('name');
      if (error) {
        console.error('Error fetching classes:', error);
        return;
      }
      setClasses(data || []);
    };
    fetchClasses();
  }, []);

  // Load report
  const loadReport = useCallback(async () => {
    if (!selectedClassId) return;
    setLoading(true);
    try {
      const data = await unitTestMarksService.getClassReport(selectedClassId);
      setReportData(data);

      // Determine all subjects
      const allSubjects = new Set<string>();
      data.forEach((s) => Object.keys(s.subjects).forEach((sub) => allSubjects.add(sub)));
      
      const classObj = classes.find((c) => c.id === selectedClassId);
      const className = classObj?.name || '';
      setSelectedClassName(className);

      const matchedKey = Object.keys(SUBJECTS_BY_CLASS).find((key) =>
        className.toLowerCase().includes(key.toLowerCase())
      );
      const orderedSubjects = matchedKey ? SUBJECTS_BY_CLASS[matchedKey] : [];
      const finalSubjects = orderedSubjects.filter((s) => allSubjects.has(s));
      allSubjects.forEach((s) => {
        if (!finalSubjects.includes(s)) finalSubjects.push(s);
      });
      
      setSubjectList(finalSubjects);
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, classes]);

  useEffect(() => {
    if (selectedClassId) loadReport();
  }, [selectedClassId, loadReport]);

  // Load copy requests
  const loadCopyRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const filters: any = {};
      if (requestFilter !== 'all') filters.status = requestFilter;
      if (requestClassFilter !== 'all') filters.classId = requestClassFilter;
      const data = await copyRequestService.getAllRequests(filters);
      setCopyRequests(data);
    } catch (error) {
      console.error('Error loading copy requests:', error);
      toast.error('Failed to load copy requests');
    } finally {
      setLoadingRequests(false);
    }
  }, [requestFilter, requestClassFilter]);

  useEffect(() => {
    if (activeTab === 'requests') loadCopyRequests();
  }, [activeTab, loadCopyRequests]);

  // Handle status update
  const handleStatusUpdate = async () => {
    if (!statusDialog.request || !newStatus) return;
    setUpdatingStatus(true);
    try {
      await copyRequestService.updateStatus(statusDialog.request.id, newStatus, adminNotes);
      toast.success('Request status updated');
      setStatusDialog({ open: false, request: null });
      setNewStatus('');
      setAdminNotes('');
      loadCopyRequests();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Stats
  const totalStudents = reportData.length;
  const avgTotal = totalStudents > 0
    ? (reportData.reduce((sum, s) => sum + s.grandTotal, 0) / totalStudents).toFixed(1)
    : '0';
  const topScorer = reportData.reduce(
    (top, s) => (s.grandTotal > (top?.grandTotal || 0) ? s : top),
    reportData[0]
  );

  const pendingRequests = copyRequests.filter((r) => r.status === 'pending').length;

  if (profileLoading) return <LoadingSpinner />;

  if (!isAdminOrTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only administrators can view reports.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader
        title="Unit Test 4 - Reports"
        description="View marks reports and manage copy requests"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="report" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" /> Marks Report
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Copy Requests
            {pendingRequests > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0">
                {pendingRequests}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* MARKS REPORT TAB */}
        <TabsContent value="report" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label>Select Class</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section ? `- ${cls.section}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={loadReport} disabled={!selectedClassId}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {selectedClassId && reportData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-4 flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Students</p>
                    <p className="text-2xl font-bold text-blue-800">{totalStudents}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-4 flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Avg per Subject</p>
                    <p className="text-2xl font-bold text-green-800">
                      {(parseFloat(avgTotal) / (subjectList.length || 1)).toFixed(1)}/20
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-4 flex items-center gap-3">
                  <Award className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Top Scorer</p>
                    <p className="text-lg font-bold text-purple-800 truncate">
                      {topScorer?.student?.name || '-'}
                    </p>
                    <p className="text-xs text-purple-600">
                      Total: {topScorer?.grandTotal || 0}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Report Table */}
          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : selectedClassId && reportData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {selectedClassName} - Unit Test 4 Report
                  <Badge variant="outline">{reportData.length} Students</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">#</TableHead>
                        <TableHead>Student</TableHead>
                        {subjectList.map((subject) => (
                          <TableHead key={subject} className="text-center min-w-[80px]">
                            <div className="text-xs">
                              <div className="font-semibold">{subject}</div>
                              <div className="text-muted-foreground">(20)</div>
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="text-center font-bold">Grand Total</TableHead>
                        <TableHead className="text-center">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((row, index) => {
                        const maxPossible = subjectList.length * 20;
                        const percentage = maxPossible > 0
                          ? ((row.grandTotal / maxPossible) * 100).toFixed(1)
                          : '0';
                        return (
                          <TableRow key={row.student?.id || index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{row.student?.name || '-'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {row.student?.admissionNumber}
                                </div>
                              </div>
                            </TableCell>
                            {subjectList.map((subject) => {
                              const marks = row.subjects[subject];
                              return (
                                <TableCell key={subject} className="text-center">
                                  {marks ? (
                                    <div>
                                      <span
                                        className={cn(
                                          'font-bold',
                                          marks.total >= 16 ? 'text-green-600' :
                                          marks.total >= 10 ? 'text-blue-600' :
                                          marks.total >= 7 ? 'text-yellow-600' : 'text-red-600'
                                        )}
                                      >
                                        {marks.total}
                                      </span>
                                      <div className="text-xs text-muted-foreground">
                                        W:{marks.writing} O:{marks.oral}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
                                  )}
                                </TableCell>
                              );
                            })}
                            <TableCell className="text-center">
                              <span className="font-bold text-lg">{row.grandTotal}</span>
                              <span className="text-xs text-muted-foreground">/{maxPossible}</span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  parseFloat(percentage) >= 80 ? 'bg-green-50 text-green-700' :
                                  parseFloat(percentage) >= 60 ? 'bg-blue-50 text-blue-700' :
                                  parseFloat(percentage) >= 40 ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                )}
                              >
                                {percentage}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : selectedClassId ? (
            <Card className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No marks entered for this class yet. Go to the marks entry page first.
              </p>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Select a class to view the report.</p>
            </Card>
          )}
        </TabsContent>

        {/* COPY REQUESTS TAB */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <Label>Filter by Status</Label>
                  <Select value={requestFilter} onValueChange={setRequestFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Requests</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label>Filter by Class</Label>
                  <Select value={requestClassFilter} onValueChange={setRequestClassFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.section ? `- ${cls.section}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" onClick={loadCopyRequests}>
                  <RefreshCw className="h-4 w-4 mr-1" /> Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Request Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const count = copyRequests.filter((r) => r.status === key).length;
              return (
                <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setRequestFilter(key)}>
                  <CardContent className="pt-3 pb-3 text-center">
                    <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
                      {config.icon} {config.label}
                    </div>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Requests List */}
          {loadingRequests ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : copyRequests.length > 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Parent</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {copyRequests.map((req, index) => {
                        const statusInfo = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                        return (
                          <TableRow key={req.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{req.student?.name || '-'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {req.student?.admissionNumber}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {req.class?.name || '-'} {req.class?.section || ''}
                            </TableCell>
                            <TableCell>{req.parent_name}</TableCell>
                            <TableCell>
                              <a href={`tel:${req.parent_contact}`} className="text-blue-600 hover:underline">
                                {req.parent_contact}
                              </a>
                            </TableCell>
                            <TableCell>{req.subject || 'All'}</TableCell>
                            <TableCell>
                              <Badge className={cn('text-xs', statusInfo.color)} variant="outline">
                                {statusInfo.icon}
                                <span className="ml-1">{statusInfo.label}</span>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {new Date(req.requested_at).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setStatusDialog({ open: true, request: req });
                                  setNewStatus(req.status);
                                  setAdminNotes(req.admin_notes || '');
                                }}
                              >
                                Update
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No copy requests found.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => {
        if (!open) setStatusDialog({ open: false, request: null });
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
          </DialogHeader>
          {statusDialog.request && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Student:</strong> {statusDialog.request.student?.name}</p>
                <p><strong>Parent:</strong> {statusDialog.request.parent_name}</p>
                <p><strong>Contact:</strong> {statusDialog.request.parent_contact}</p>
                {statusDialog.request.reason && (
                  <p><strong>Reason:</strong> {statusDialog.request.reason}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updatingStatus}>
              {updatingStatus ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
