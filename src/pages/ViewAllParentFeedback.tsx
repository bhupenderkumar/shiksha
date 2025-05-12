import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentSubmittedFeedbackService } from '@/services/parentSubmittedFeedbackService';
import { classService } from '@/services/classService';
import { ParentSubmittedFeedback, ClassOption } from '@/types/parentFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  Search,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  Filter,
  Download,
  RefreshCw,
  User,
  Calendar,
  School,
  MessageSquare,
  X,
  Edit,
  Save,
  MessageCircle,
  Reply
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import AdminFeedbackModal from '@/components/AdminFeedbackModal';

const ViewAllParentFeedback: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<ParentSubmittedFeedback[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<ParentSubmittedFeedback | null>(null);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<'PENDING' | 'REVIEWED' | 'RESPONDED'>('PENDING');

  // Status update state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Admin feedback modal state
  const [isAdminFeedbackModalOpen, setIsAdminFeedbackModalOpen] = useState(false);

  // List of months
  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load feedback and classes on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all feedback
        const feedbackData = await parentSubmittedFeedbackService.getAllFeedback();
        setFeedback(feedbackData);

        // Fetch all classes
        const classData = await classService.getAllClasses();
        setClasses(classData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter feedback based on search term and filters
  const filteredFeedback = feedback.filter(item => {
    // Filter by search term (student name or parent name)
    const matchesSearch =
      item.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.parent_name.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by class
    const matchesClass = classFilter === 'all' || item.class_id === classFilter;

    // Filter by month
    const matchesMonth = monthFilter === 'all' || item.month === monthFilter;

    // Filter by status
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesClass && matchesMonth && matchesStatus;
  });

  // Handle refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const feedbackData = await parentSubmittedFeedbackService.getAllFeedback();
      setFeedback(feedbackData);
      toast.success('Feedback data refreshed');
    } catch (error) {
      console.error('Error refreshing data:', error);
      toast.error('Failed to refresh feedback data');
    } finally {
      setLoading(false);
    }
  };

  // Handle opening the feedback modal
  const handleOpenFeedbackModal = (item: ParentSubmittedFeedback) => {
    setSelectedFeedback(item);
    setNewStatus(item.status as 'PENDING' | 'REVIEWED' | 'RESPONDED');
    setIsModalOpen(true);
    setIsEditingStatus(false);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
    setIsEditingStatus(false);
  };

  // Handle status update in modal
  const handleUpdateStatus = async () => {
    if (!selectedFeedback) return;

    try {
      await parentSubmittedFeedbackService.updateFeedbackStatus(selectedFeedback.id, newStatus);

      // Update the feedback in the local state
      setFeedback(prevFeedback =>
        prevFeedback.map(item =>
          item.id === selectedFeedback.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      // Update the selected feedback
      setSelectedFeedback(prev => prev ? { ...prev, status: newStatus } : null);

      toast.success('Feedback status updated successfully');
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  // Handle status change from table
  const handleStatusChange = async (id: string, status: 'PENDING' | 'REVIEWED' | 'RESPONDED') => {
    try {
      setUpdatingStatusId(id);

      // Update the status in the database
      await parentSubmittedFeedbackService.updateFeedbackStatus(id, status);

      // Update the feedback in the local state
      setFeedback(prevFeedback =>
        prevFeedback.map(item =>
          item.id === id
            ? { ...item, status }
            : item
        )
      );

      // If the selected feedback is the one being updated, update it too
      if (selectedFeedback && selectedFeedback.id === id) {
        setSelectedFeedback(prev => prev ? { ...prev, status } : null);
      }

      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Handle opening the admin feedback modal
  const handleOpenAdminFeedbackModal = (item: ParentSubmittedFeedback) => {
    setSelectedFeedback(item);
    setIsAdminFeedbackModalOpen(true);
  };

  // Handle admin feedback success
  const handleAdminFeedbackSuccess = (updatedFeedback: ParentSubmittedFeedback) => {
    // Update the feedback in the local state
    setFeedback(prevFeedback =>
      prevFeedback.map(item =>
        item.id === updatedFeedback.id
          ? updatedFeedback
          : item
      )
    );

    // Update the selected feedback if it's the one being updated
    if (selectedFeedback && selectedFeedback.id === updatedFeedback.id) {
      setSelectedFeedback(updatedFeedback);
    }
  };

  // Render status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'REVIEWED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Eye className="h-3 w-3 mr-1" /> Reviewed</Badge>;
      case 'RESPONDED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Responded</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" /> {status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Parent Submitted Feedback</CardTitle>
            <CardDescription>
              View and manage feedback submitted by parents
            </CardDescription>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="class">Filter by Class</Label>
              <Select
                value={classFilter}
                onValueChange={setClassFilter}
              >
                <SelectTrigger id="class">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} {cls.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="month">Filter by Month</Label>
              <Select
                value={monthFilter}
                onValueChange={setMonthFilter}
              >
                <SelectTrigger id="month">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((month) => (
                    <SelectItem key={month} value={month}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Filter by Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="REVIEWED">Reviewed</SelectItem>
                  <SelectItem value="RESPONDED">Responded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Feedback Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="text-center py-8 border rounded-md bg-gray-50">
              <p className="text-muted-foreground">No feedback found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Parent Name</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Status & Actions</TableHead>
                    <TableHead>View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFeedback.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.student_name}</TableCell>
                      <TableCell>{item.className} {item.classSection}</TableCell>
                      <TableCell>{item.parent_name}</TableCell>
                      <TableCell>{item.month}</TableCell>
                      <TableCell>{format(new Date(item.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(item.status)}
                          {updatingStatusId === item.id ? (
                            <div className="w-[130px] h-8 flex items-center justify-center border rounded-md">
                              <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                          ) : (
                            <Select
                              value={item.status}
                              onValueChange={(value) => handleStatusChange(item.id, value as 'PENDING' | 'REVIEWED' | 'RESPONDED')}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue placeholder="Change Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="REVIEWED">Reviewed</SelectItem>
                                <SelectItem value="RESPONDED">Responded</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenFeedbackModal(item)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenAdminFeedbackModal(item)}
                            className={item.admin_feedback ? "text-green-600" : ""}
                          >
                            {item.admin_feedback ? (
                              <>
                                <MessageCircle className="h-4 w-4 mr-1" />
                                Edit Feedback
                              </>
                            ) : (
                              <>
                                <Reply className="h-4 w-4 mr-1" />
                                Add Feedback
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feedback Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedFeedback ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Feedback Details</span>
                  {renderStatusBadge(selectedFeedback.status)}
                </DialogTitle>
                <DialogDescription>
                  Feedback submitted by {selectedFeedback.parent_name} ({selectedFeedback.parent_relation})
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* Student Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Student Name</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{selectedFeedback.student_name}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Class</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <School className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedFeedback.className} {selectedFeedback.classSection}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Parent Name</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedFeedback.parent_name}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Month</Label>
                    <div className="flex items-center mt-1 p-2 border rounded-md bg-gray-50">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{selectedFeedback.month}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Feedback</Label>
                  <div className="mt-1 p-3 border rounded-md bg-gray-50 whitespace-pre-wrap">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground inline-block" />
                    {selectedFeedback.feedback}
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Progress Rating</Label>
                  <div className="mt-1 p-3 border rounded-md bg-gray-50">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground inline-block" />
                    {selectedFeedback.progress_feedback}
                  </div>
                </div>

                {/* Admin Feedback (if exists) */}
                {selectedFeedback.admin_feedback && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Admin Feedback</Label>
                    <div className="mt-1 p-3 border rounded-md bg-green-50 border-green-200">
                      <MessageCircle className="h-4 w-4 mr-2 text-green-600 inline-block" />
                      {selectedFeedback.admin_feedback}

                      {selectedFeedback.admin_feedback_date && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Added on: {format(new Date(selectedFeedback.admin_feedback_date), 'MMMM d, yyyy h:mm a')}
                        </div>
                      )}
                    </div>

                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenAdminFeedbackModal(selectedFeedback)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit Admin Feedback
                      </Button>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground">Submission Details</Label>
                  <div className="mt-1 p-3 border rounded-md bg-gray-50 text-sm text-muted-foreground">
                    <div>Submitted on: {format(new Date(selectedFeedback.created_at), 'MMMM d, yyyy h:mm a')}</div>
                    {selectedFeedback.updated_at !== selectedFeedback.created_at && (
                      <div>Last updated: {format(new Date(selectedFeedback.updated_at), 'MMMM d, yyyy h:mm a')}</div>
                    )}
                  </div>
                </div>

                {/* Status Management */}
                <div className="border rounded-md p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-medium">Current Status</h3>
                      <div className="mt-1">
                        {renderStatusBadge(selectedFeedback.status)}
                      </div>
                    </div>

                    {!isEditingStatus ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingStatus(true)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Change Status
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingStatus(false)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>

                  {isEditingStatus && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium mb-2">Update Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          value={newStatus}
                          onValueChange={(value) => setNewStatus(value as 'PENDING' | 'REVIEWED' | 'RESPONDED')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="REVIEWED">Reviewed</SelectItem>
                            <SelectItem value="RESPONDED">Responded</SelectItem>
                          </SelectContent>
                        </Select>

                        <Button
                          onClick={handleUpdateStatus}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save Status
                        </Button>
                      </div>

                      <div className="mt-2 text-sm text-muted-foreground">
                        <p>Status meanings:</p>
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li><span className="font-medium">Pending</span>: Feedback has been submitted but not yet reviewed</li>
                          <li><span className="font-medium">Reviewed</span>: Feedback has been reviewed by staff</li>
                          <li><span className="font-medium">Responded</span>: Staff has responded to the feedback</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button onClick={handleCloseModal}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <div className="py-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p>Loading feedback details...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Feedback Modal */}
      <AdminFeedbackModal
        isOpen={isAdminFeedbackModalOpen}
        onClose={() => setIsAdminFeedbackModalOpen(false)}
        feedback={selectedFeedback}
        onSuccess={handleAdminFeedbackSuccess}
      />
    </div>
  );
};

export default ViewAllParentFeedback;
